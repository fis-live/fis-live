import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { defer, EMPTY, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, repeat, retry, switchMap, withLatestFrom } from 'rxjs/operators';

import { RaceActions } from '../state/actions';
import { setRaceMessage, updateMeteo, updateRaceInfo } from '../state/actions/info';
import { initialize, update } from '../state/actions/race';
import { AppState, selectFavoriteRacers } from '../state/reducers';
import { unserialize } from '../utils/unserialize';

import { Adapter } from './cross-country/adapter';
import { MainArray, UpdateArray } from './cross-country/api/types';
import { PdfData, Racer } from './cross-country/models';
import { FisSignature } from './fis-signature';
import { FisServer, Race, ServerList } from './shared';

export interface ActionWithTimestamp {
    timestamp: number;
    actions: Action[];
}

@Injectable({
    providedIn: 'root'
})
export class FisConnectionService {
    private delay = 0;
    private codex: number | null = null;
    private sectorCode: 'cc' | 'nk' = 'cc';
    private version: number = 0;
    private doc: 'main' | 'update' | 'pdf' = 'main';
    private pdfDoc: 'SL' | 'QUA' | 'SLCC' = 'SL';

    private baseURL: string = 'http://live.fis-ski.com/';
    private proxy: string = 'https://fis-live-cors.onrender.com/';

    private servers: FisServer[] = [];

    private readonly serverListUrl = 'http://live.fis-ski.com/general/serverList.json';
    private readonly signature = new FisSignature();

    constructor(private _http: HttpClient, private _store: Store<AppState>) {}

    public initialize(codex: number, sectorCode: 'cc' | 'nk'): void {
        this.codex = codex;
        this.sectorCode = sectorCode;
        this.doc = 'main';
        this.version = 0;
        this.delay = 0;
        this.signature.reset();
    }

    public getServerList(): Observable<FisServer[]> {
        return this._http.get<ServerList>(this.proxy + this.serverListUrl, {
            params: new HttpParams().set('i', this.signature.get())
        }).pipe(map(res => this.parseServerList(res)));
    }

    public poll(codex: number, sectorCode: 'cc' | 'nk'): Observable<ActionWithTimestamp> {
        this.initialize(codex, sectorCode);

        return defer(() => timer(this.delay)).pipe(
            switchMap(() => this.getHttpRequest()),
            withLatestFrom(this._store.select(selectFavoriteRacers)),
            mergeMap(([result, favorites]) => this.parse(result, favorites)),
            catchError(error => this.handleError(error)),
            retry(10),
            repeat()
        );
    }

    private getHttpRequest() {
        let url: string;
        switch (this.doc) {
            case 'main':
                url = `${this.baseURL}mobile/${this.sectorCode}-${this.codex}/main.xml`;
                break;
            case 'update':
                url = `${this.baseURL}mobile/${this.sectorCode}-${this.codex}/updt${this.version}.xml`;
                break;
            case 'pdf':
                return this._http.get<PdfData[]>(`${this.proxy}pdf.json?codex=${this.codex}&doc=${this.pdfDoc}&sectorCode=${this.sectorCode}`);
        }

        return this._http.get(this.proxy + url, {
            responseType: 'text',
            params: new HttpParams().set('i', this.signature.get())
        });
    }

    private parse(result: string | PdfData[], favorites: Racer[] = []) {
        let timestamp = Date.now();
        let actions: Action[] = [];
        if (typeof result === 'string') {
            this.signature.success();
            const data = unserialize(result.slice(4, -5)) as MainArray | UpdateArray;
            if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
                throw new Error('No live information');
            }
            this.version = data.live[1];

            if (this.doc === 'main') {
                this.doc = 'pdf';
                const main = Adapter.parseMain(data as MainArray, favorites, this.sectorCode);

                this.pdfDoc = this.sectorCode === 'nk' ? 'SLCC' : (main.runInfo[1] === 'Q' ? 'QUA' : 'SL');
                actions.push(updateRaceInfo({ raceInfo: main.raceInfo }));
                actions.push(setRaceMessage({ message: main.message }));
                actions.push(updateMeteo({ meteo: main.meteo }));
                actions.push(initialize({ main }));
            } else {
                this.delay = data.live[0] * 1000;
                const updt = Adapter.parseUpdate(data as UpdateArray);

                if (updt.events.length > 0) {
                    actions.push(update({
                        events: updt.events,
                        timestamp
                    }));
                }

                if (updt.reload) {
                    this.doc = 'main';
                }
            }
        } else {
            this.doc = 'update';
            timestamp = 0;
            actions = result.length > 0 ? [RaceActions.parsePdf({ racers: result })] : [];
        }

        return actions.length > 0 ? of({
            timestamp,
            actions
        }) : EMPTY;
    }

    private parseServerList(result: ServerList): FisServer[] {
        this.signature.success();

        for (const server of result.servers) {
            this.servers.push({url: server[0], weight: server[1], index: server[2]});
        }

        this.selectServer();
        return this.servers;
    }

    private handleError(error: HttpErrorResponse) {
        if (this.doc === 'pdf' && error.status === 404) {
            this.doc = 'update';
            return EMPTY;
        }

        const count = this.signature.error();
        if (count >= 5) {
            this.selectServer();
            this.doc = 'main';
        }

        this.delay = (this.delay > 0) ? this.delay : 1000;

        return throwError(() => error);
    }

    public loadCalendar(): Observable<Race[]> {
        return this._http.get<Race[]>('https://fis-live-cors.onrender.com/liveraces.json')
            .pipe(
                catchError((error) => {
                    console.log(error);
                    const errMsg = (error instanceof Error) ? error :
                        (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

                    return throwError(() => errMsg);
                })
            );
    }

    public selectServer(): void {
        let sum = 0;

        for (let i = 0; i < this.servers.length; i++) {
            sum += this.servers[i].weight;
        }

        let urlServer: string | null = null;

        const r = Math.random() * sum;
        let partialSum = 0;
        let j = 0;
        while (urlServer === null && partialSum <= r) {
            partialSum += this.servers[j].weight;

            if (r < partialSum) {
                urlServer = this.servers[j].url;
            }

            j++;
        }

        this.baseURL = `http://${urlServer}/`;
    }
}

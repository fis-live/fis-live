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
import { FisServer, Race, ServerList } from './shared';

export interface ActionWithTimestamp {
    timestamp: number;
    shouldDelay: boolean;
    actions: Action[];
}

@Injectable({
    providedIn: 'root'
})
export class FisConnectionService {
    private readonly signature: string;
    private updateCount = 0;
    private errorCount = 0;
    private interval = 0;
    private delay = 0;
    private startRequest = 0;

    private codex: number | null = null;
    private sectorCode: 'cc' | 'nk' = 'cc';
    private discipline: string = '';
    private version: number = 0;
    private initialized = false;
    private doc: 'main' | 'update' | 'pdf' = 'main';
    private pdfDoc: 'SL' | 'QUA' | 'SLCC' = 'SL';

    private baseURL: string = 'http://live.fis-ski.com/';
    private proxy: string = 'https://fislive-cors.herokuapp.com/';

    private server_list: FisServer[] = [];

    private readonly serverListUrl = 'http://live.fis-ski.com/general/serverList.json';

    constructor(private _http: HttpClient, private _store: Store<AppState>) {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number, sectorCode: 'cc' | 'nk'): void {
        this.codex = codex;
        this.sectorCode = sectorCode;
        this.discipline = '';
        this.doc = 'main';
        this.initialized = false;
        this.version = 0;
        this.delay = 0;
        this.updateCount = 0;
        this.errorCount = 0;
    }

    private getQueryString(): string {
        const d = new Date();
        this.startRequest = d.getTime();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-` + d.getMilliseconds().toString();
    }

    public getServerList(): Observable<FisServer[]> {
        return this._http.get<ServerList>(this.proxy + this.serverListUrl, {
            params: new HttpParams().set('i', this.getQueryString())
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
            params: new HttpParams().set('i', this.getQueryString())
        });
    }

    private parse(result: string | PdfData[], favorites: Racer[] = []) {
        let shouldDelay = true;
        let actions: Action[] = [];
        if (typeof result === 'string') {
            this.interval = Date.now() - this.startRequest;
            const data = unserialize(result.slice(4, -5)) as MainArray | UpdateArray;
            if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
                throw new Error('No live information');
            }

            if (this.doc === 'main') {
                this.doc = 'pdf';
                const main = Adapter.parseMain(data as MainArray, favorites);
                this.discipline = main.raceInfo.discipline;

                this.pdfDoc = this.sectorCode === 'nk' ? 'SLCC' : (main.runInfo[1] === 'Q' ? 'QUA' : 'SL');
                this.initialized = true;
                this.version = main.live[1];
                this.updateCount++;
                this.errorCount = 0;
                shouldDelay = this.initialized;
                actions.push(updateRaceInfo({ raceInfo: main.raceInfo }));
                actions.push(setRaceMessage({ message: main.message }));
                actions.push(updateMeteo({ meteo: main.meteo }));
                actions.push(initialize({ main }));
                this.initialized = true;
            } else {
                this.delay = data.live[0] * 1000;
                this.version = data.live[1];
                this.updateCount++;
                this.errorCount = 0;
                actions = this.parseUpdate(<UpdateArray> data);
            }
        } else {
            this.doc = 'update';
            shouldDelay = false;
            actions = this.parsePdf(result);
        }

        return actions.length > 0 ? of({
            shouldDelay,
            timestamp: Date.now(),
            actions
        }) : EMPTY;
    }

    private parseServerList(result: ServerList): FisServer[] {
        this.interval = Date.now() - this.startRequest;

        for (const server of result.servers) {
            if (server[0] !== 'l6.novius.net') {
                this.server_list.push({url: server[0], weight: server[1], index: server[2]});
            }
        }

        this.selectServer();
        return this.server_list;
    }

    private handleError(error: HttpErrorResponse) {
        if (this.doc === 'pdf' && error.status === 404) {
            this.doc = 'update';
            return EMPTY;
        }

        this.errorCount++;
        this.interval = Date.now() - this.startRequest;
        if (this.errorCount >= 5) {
            this.selectServer();
            this.doc = 'main';
        }

        this.delay = (this.delay > 0) ? this.delay : 1000;

        return throwError(error);
    }

    public loadCalendar(): Observable<Race[]> {
        return this._http.get<Race[]>('https://fislive-cors.herokuapp.com/liveraces.json')
            .pipe(
                catchError((error) => {
                    console.log(error);
                    const errMsg = (error instanceof Error) ? error :
                        (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

                    return throwError(errMsg);
                })
            );
    }

    private parsePdf(data: PdfData[]): Action[] {
        return data.length > 0 ? [RaceActions.parsePdf({ racers: data })] : [];
    }

    private parseUpdate(data: UpdateArray): Action[] {
        const actions: Action[] = [];
        const updt = Adapter.parseUpdate(data);

        if (updt.events.length > 0) {
            actions.push(update({
                events: updt.events,
                timestamp: Date.now()
            }));
        }

        if (updt.reload) {
            this.doc = 'main';
        }

        return actions;
    }

    public selectServer(): void {
        let sum = 0;

        for (let i = 0; i < this.server_list.length; i++) {
            sum += this.server_list[i].weight;
        }

        let urlServer: string | null = null;

        const r = Math.random() * sum;
        let partialSum = 0;
        let j = 0;
        while (urlServer === null && partialSum <= r) {
            partialSum += this.server_list[j].weight;

            if (r < partialSum) {
                urlServer = this.server_list[j].url;
            }

            j++;
        }

        this.baseURL = `http://${urlServer}/`;
    }
}

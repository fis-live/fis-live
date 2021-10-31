import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { defer, EMPTY, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, repeat, retry, switchMap, withLatestFrom } from 'rxjs/operators';

import { Intermediate } from '../models/intermediate';
import { Meteo } from '../models/meteo';
import { Race } from '../models/race';
import { RaceInfo } from '../models/race-info';
import { Racer } from '../models/racer';
import { RaceActions } from '../state/actions';
import { setRaceMessage, updateMeteo, updateRaceInfo } from '../state/actions/info';
import { initialize, update } from '../state/actions/race';
import { AppState, selectFavoriteRacers } from '../state/reducers';
import { unserialize } from '../utils/unserialize';
import { fixEncoding, toTitleCase } from '../utils/utils';

import { nationalities, Status, statusMap } from './fis-constants';
import { FisEvent, FisServer, Main, PdfData, Result, ServerList, StartListEntry, Update } from './models';

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

        // @ts-ignore
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
            const data = unserialize(result.slice(4, -5)) as Main | Update;
            if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
                throw new Error('No live information');
            }

            if (this.doc === 'main') {
                this.doc = 'pdf';
                this.version = data.live[1];
                this.updateCount++;
                this.errorCount = 0;
                shouldDelay = this.initialized;
                actions = this.parseMain(<Main> data, favorites);
            } else {
                this.delay = data.live[0] * 1000;
                this.version = data.live[1];
                this.updateCount++;
                this.errorCount = 0;
                actions = this.parseUpdate(<Update> data);
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

    private truncateTime(time: number, inter: string) {
        if (inter === 'bonuspoint' || inter === 'bonustime') {
            return time;
        } else if (this.discipline === 'SP') {
            return time - time % 10;
        }

        return time - time % 100;
    }

    private parseMain(data: Main, favorites: Racer[]): Action[] {
        const actions: Action[] = [];
        const raceInfo: RaceInfo = {
            eventName: fixEncoding(data.raceinfo[0]),
            raceName: fixEncoding(data.raceinfo[1]),
            slopeName: fixEncoding(data.raceinfo[2]),
            discipline: data.raceinfo[3].toUpperCase(),
            gender: data.raceinfo[4].toUpperCase(),
            category: data.raceinfo[5].toUpperCase(),
            place: fixEncoding(data.raceinfo[6]),
            temperatureUnit: data.raceinfo[7],
            lengthUnit: data.raceinfo[8],
            speedUnit: data.raceinfo[9],
            team: data.raceinfo[13],
            tds: data.raceinfo[14]
        };
        this.discipline = raceInfo.discipline;
        if (raceInfo.temperatureUnit.length === 1) {
            raceInfo.temperatureUnit = '°' + raceInfo.temperatureUnit;
        }
        if (raceInfo.lengthUnit == null) {
            raceInfo.lengthUnit = 'm';
        }
        if (raceInfo.speedUnit == null) {
            raceInfo.speedUnit = 'kmh';
        }

        const meteo: Meteo = {
            air_temperature: data.meteo[0],
            wind: data.meteo[1],
            weather: data.meteo[2],
            snow_temperature: data.meteo[3],
            humidity: data.meteo[4],
            snow_condition: data.meteo[5]
        };

        actions.push(updateRaceInfo({raceInfo}));
        actions.push(setRaceMessage({message: data.message ?? ''}));
        actions.push(updateMeteo({meteo}));

        const intermediates: Intermediate[] = [];
        const racers: Racer[] = [];
        const results: Result[] = [];
        const startList: { [bib: number]: StartListEntry } = {};

        intermediates.push({type: 'start_list', key: 0, id: 0, distance: 0, name: 'Start list', short: '0 ' + raceInfo.lengthUnit});

        for (const def of data.racedef) {
            const index = data.racedef.indexOf(def);
            let name: string;
            let type: 'start_list' | 'inter' | 'finish' | 'bonus_points' | 'bonus_time' | 'standing';
            let short: string;
            const [_type, id, distanceOrName] = def;

            switch (_type) {
                case 'inter':
                    type = 'inter';
                    if (distanceOrName && distanceOrName > 0) {
                        name = short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + id;
                    }
                    break;
                case 'bonuspoint':
                    type = 'bonus_points';
                    if (distanceOrName && distanceOrName > 0) {
                        name = 'Bonus points at ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = 'Bonus ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Bonus points';
                    }
                    break;
                case 'bonustime':
                    type = 'bonus_time';
                    if (distanceOrName && distanceOrName > 0) {
                        name = 'Bonus time at ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = 'Bonus ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Bonus time';
                    }
                    break;
                case 'finish':
                    type = 'finish';
                    if (distanceOrName && distanceOrName > 0) {
                        name = 'Finish ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Finish';
                    }
                    break;
                case 'standing':
                    type = 'standing';
                    if (distanceOrName) {
                        name = short = '' + distanceOrName;
                    } else {
                        name = short = 'Standing';
                    }
                    break;
                default:
                    type = 'inter';
                    if (distanceOrName && distanceOrName > 0) {
                        name = short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + id;
                    }
                    break;
            }

            if (_type !== 'start') {
                intermediates.push({key: index + 1, id: id, distance: +distanceOrName!, name, short, type});
            }
        }

        for (const racer of data.racers) {
            if (racer !== null) {
                const firstName = toTitleCase(fixEncoding(racer[3]?.trim() ?? ''));
                const lastName = toTitleCase(fixEncoding(racer[2]?.trim() ?? ''));
                const initials = firstName.split(/([ -])/).map(str => str[0]).join('').replace(' ', '.');

                racers.push({
                    id: racer[0],
                    bib: racer[1],
                    firstName,
                    lastName,
                    display: firstName !== '' ? firstName + ' ' + lastName : lastName,
                    value: (firstName !== '' ? lastName + ', ' + firstName : lastName).toLowerCase(),
                    short: initials !== '' ? initials + '. ' + lastName : lastName,
                    nsa:  nationalities[racer[4]] || racer[4],
                    isFavorite: favorites.find((value) => value.id === racer[0]) !== undefined,
                    hasYellowCard: racer[6] === 'yc',
                    color: racer[5],
                    sector: this.sectorCode
                });
            }
        }

        for (let i = 0; i < data.result.length; i++) {
            const res = data.result[i];
            if (res !== null) {
                for (let j = 0; j < res.length; j++) {
                    if (data.racedef[j][1] === 0) {

                    } else if (res[j] !== null) {
                        const time = this.truncateTime(res[j]!, data.racedef[j][0]);
                        results.push({
                            status: Status.Default, intermediate: data.racedef[j][1], racer: i, time: time, run: data.runinfo[0]
                        });
                    }
                }
            }
        }

        for (const entry of data.startlist) {
            if (entry !== null) {
                const notes = [];
                const [bib, note, order, status, heats] = entry;
                switch (note) {
                    case 'q':
                        notes.push('Q');
                        break;
                    case 'lucky':
                    case 'currentlucky':
                        notes.push('LL');
                        break;
                    case 'ff':
                        notes.push('PF');
                        break;
                }

                startList[bib] = {
                    racer: bib,
                    status: statusMap[status || ''] || status || '',
                    order: order,
                    notes: notes
                };

                switch (status) {
                    case 'ral':
                    case 'lapped':
                    case 'dnf':
                    case 'dq':
                    case 'dsq':
                    case 'dns':
                    case 'nps':
                        results.push({
                            status: statusMap[status] || status || '',
                            intermediate: 99,
                            racer: bib,
                            time: 0,
                            run: data.runinfo[0]
                        });
                        break;
                }
            }
        }

        actions.push(initialize({
            intermediates,
            racers,
            startList,
            results,
            precision: this.discipline === 'SP' ? -2 : -1
        }));

        this.pdfDoc = this.sectorCode === 'nk' ? 'SLCC' : (data.runinfo[1] === 'Q' ? 'QUA' : 'SL');
        this.initialized = true;

        return actions;
    }

    private parseUpdate(data: Update): Action[] {
        const actions: Action[] = [];
        const events: FisEvent[] = [];
        let reload = false;
        let stopUpdating = false;

        if (data.events) {
            for (const event of data.events) {
                switch (event[0]) {
                    case 'inter':
                    case 'bonuspoint':
                    case 'bonustime':
                    case 'standing':
                        if (event[4]) {
                            const t = this.truncateTime(event[4], event[0]);
                            events.push({
                                type: 'register_result',
                                payload: {status: Status.Default, intermediate: event[3], racer: event[2], time: t, run: event[1]}
                            });
                        } else {
                            events.push({
                                type: 'register_result',
                                payload: {status: Status.NA, intermediate: event[3], racer: event[2], time: 0, run: event[1]}
                            });
                        }
                        break;
                    case 'finish':
                        const time = this.truncateTime(event[4], event[0]);
                        events.push({
                            type: 'register_result',
                            payload: {status: Status.Finished, intermediate: event[3], racer: event[2], time: time, run: event[1]}
                        });
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]], run: event[1]}
                        });
                        break;
                    case 'sanction':
                        events.push({
                            type: 'sanction',
                            payload: event[2]
                        });
                        break;
                    case 'dnf':
                    case 'dns':
                    case 'dq':
                    case 'dsq':
                    case 'ral':
                    case 'nps':
                    case 'lapped':
                        events.push({
                            type: 'register_result',
                            payload: {
                                status: statusMap[event[0]],
                                intermediate: 99,
                                racer: event[2],
                                time: 0,
                                run: event[1]
                            }
                        });
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]], run: event[1]}
                        });
                        break;
                    case 'q':
                        events.push({
                            type: 'add_note',
                            payload: {bib: event[2], note: 'Q', run: event[1]}
                        });
                        break;
                    case 'nq':
                        events.push({
                            type: 'remove_note',
                            payload: {bib: event[2], note: 'Q', run: event[1]}
                        });
                        break;
                    case 'currentlucky':
                    case 'lucky':
                        events.push({
                            type: 'add_note',
                            payload: {bib: event[2], note: 'LL', run: event[1]}
                        });
                        break;
                    case 'ff':
                        events.push({
                            type: 'add_note',
                            payload: {bib: event[2], note: 'PF', run: event[1]}
                        });
                        break;
                    case 'start':
                    case 'nextstart':
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]], run: event[1]}
                        });
                        break;
                    case 'meteo':
                        actions.push(updateMeteo({meteo: {
                                air_temperature: event[1],
                                wind: event[2],
                                weather: event[3],
                                snow_temperature: event[4],
                                humidity: event[5],
                                snow_condition: event[6]
                            }}));
                        break;
                    case 'message':
                        actions.push(setRaceMessage({message: event[1] ?? ''}));
                        break;
                    case 'reloadmain':
                    case 'reloadflash':
                        reload = true;
                        break;
                    case 'official_result':
                        stopUpdating = true;
                        break;

                    case 'tobeat':
                    case 'unofficial_result':
                    case 'rundef':
                    case 'activeheat':
                    case 'activerun':
                    case 'startlist':
                    case 'inprogress':
                    default:
                        console.log('Unhandled event:', event);
                        break;
                }
            }
        }

        if (events.length > 0) {
            actions.push(update({
                events, timestamp: Date.now()
            }));
        }

        if (reload) {
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

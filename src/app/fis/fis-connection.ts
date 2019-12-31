import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { defer, EMPTY, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, repeat, retry, switchMap } from 'rxjs/operators';

import { FisServer } from '../models/fis-server';
import { Intermediate } from '../models/intermediate';
import { Meteo } from '../models/meteo';
import { Race } from '../models/race';
import { RaceInfo } from '../models/race-info';
import { RaceActions } from '../state/actions';
import { batch } from '../state/actions/connection';
import { setRaceMessage, updateMeteo, updateRaceInfo } from '../state/actions/info';
import { initialize, update } from '../state/actions/race';
import { DelayBehavior } from '../utils/delayBy';
import { unserialize } from '../utils/unserialize';
import { fixEncoding, toTitleCase } from '../utils/utils';

import { nationalities, Status, statusMap } from './fis-constants';
import { FisEvent, Main, ServerList, StartListEntry, Update } from './models';

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
    private version: number = 0;
    private initialized = false;
    private doc: 'main' | 'update' | 'pdf' = 'main';

    private baseURL: string = 'http://live.fis-ski.com/';
    private proxy: string = 'https://fislive-cors.herokuapp.com/';

    private server_list: FisServer[] = [];

    private readonly serverListUrl = 'http://live.fis-ski.com/general/serverList.json';

    constructor(private _http: HttpClient) {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number | null): void {
        this.codex = codex || this.codex;
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

    public poll(codex: number | null) {
        this.initialize(codex);

        return defer(() => timer(this.delay)).pipe(
            switchMap(() => this.getHttpRequest()),
            mergeMap((result) => this.parse(result)),
            catchError(error => this.handleError(error)),
            retry(10),
            repeat()
        );
    }

    private getHttpRequest() {
        let url: string;
        switch (this.doc) {
            case 'main':
                url = `${this.baseURL}mobile/cc-${this.codex}/main.xml`;
                break;
            case 'update':
                url = `${this.baseURL}mobile/cc-${this.codex}/updt${this.version}.xml`;
                break;
            case 'pdf':
                return this._http.get<Action[]>(`${this.proxy}pdf.json?codex=${this.codex}&doc=SL`);
        }

        // @ts-ignore
        return this._http.get(this.proxy + url, {
            responseType: 'text',
            params: new HttpParams().set('i', this.getQueryString())
        });
    }

    private parse(result: string | Action[]) {
        let shouldDelay = DelayBehavior.Delay;
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
                shouldDelay = this.initialized ? DelayBehavior.Delay : DelayBehavior.Clear;
                actions = this.parseMain(<Main> data);
            } else {
                this.delay = data.live[0] * 1000;
                this.version = data.live[1];
                this.updateCount++;
                this.errorCount = 0;
                actions = this.parseUpdate(<Update> data);
            }
        } else {
            this.doc = 'update';
            shouldDelay = DelayBehavior.NoDelay;
            actions = this.parsePdf(result);
        }

        return actions.length > 0 ? of(batch({ actions, shouldDelay })) : EMPTY;
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

    private parsePdf(actions: Action[]): Action[] {
        const times: any[] = [];
        const tourStandings: any[] = [];
        const _actions: Action[] = [];
        for (const ac of actions) {
            if (ac.type === '[Result] Register start time') {
                times.push((<any>ac).time);
            } else if (ac.type === '[Result] Set tour standing') {
                tourStandings.push((<any>ac).data);
            }
        }

        if (times.length > 0) {
            _actions.push(RaceActions.setPursuitTimes({times}));
        }
        if (tourStandings.length > 0) {
            _actions.push(RaceActions.setTourStanding({times: tourStandings}));
        }

        return _actions;
    }

    private parseMain(data: Main): Action[] {
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
        actions.push(setRaceMessage({message: data.message}));
        actions.push(updateMeteo({meteo}));

        const intermediates: Intermediate[] = [];
        intermediates.push({type: 'start_list', key: 0, id: 0, distance: 0, name: 'Start list', short: '0 ' + raceInfo.lengthUnit});

        data.racedef.forEach((def, index) => {
            let name: string;
            let type: 'start_list' | 'inter' | 'finish' | 'bonus_points';
            let short: string;
            switch (def[0]) {
                case 'inter':
                    type = 'inter';
                    if (def[2] && def[2] > 0) {
                        name = short = def[2] + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + (index + 1);
                    }
                    break;
                case 'bonuspoint':
                    type = 'bonus_points';
                    if (def[2] && def[2] > 0) {
                        name = 'Bonus points at ' + def[2] + ' ' + raceInfo.lengthUnit;
                        short = 'Bonus ' + def[2] + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Bonus points';
                    }
                    break;
                case 'finish':
                    type = 'finish';
                    if (def[2] && def[2] > 0) {
                        name = 'Finish ' + def[2] + ' ' + raceInfo.lengthUnit;
                        short = def[2] + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Finish';
                    }
                    break;
                default:
                    type = 'inter';
                    if (def[2] && def[2] > 0) {
                        name = short = def[2] + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + (index + 1);
                    }
                    break;
            }

            intermediates.push({key: index + 1, id: def[1], distance: def[2], name, short, type});
        });

        const racers = [];
        const startList: { [bib: number]: StartListEntry } = {};
        for (let i = 0; i < data.racers.length; i++) {
            const racer = data.racers[i];
            if (racer !== null) {
                const firstName = toTitleCase(fixEncoding(racer[3].trim()));
                const lastName = toTitleCase(fixEncoding(racer[2].trim()));

                racers.push({
                    id: racer[0],
                    bib: racer[1],
                    firstName,
                    lastName,
                    display: firstName + ' ' + lastName,
                    value: (lastName + ', ' + firstName).toLowerCase(),
                    short: firstName[0] + '. ' + lastName,
                    nsa:  nationalities[racer[4]] || racer[4],
                    isFavorite: false,
                    hasYellowCard: racer[6] === 'yc',
                    color: racer[5]
                });
            }
        }

        const results = [];

        for (let i = 0; i < data.startlist.length; i++) {
            if (data.startlist[i] !== null) {
                startList[data.startlist[i][0]] = {
                    racer: data.startlist[i][0],
                    status: statusMap[data.startlist[i][1]] || data.startlist[i][1] || '',
                    order: i + 1
                };
                switch (data.startlist[i][1]) {
                    case 'ral':
                    case 'lapped':
                    case 'dnf':
                    case 'dq':
                    case 'dsq':
                    case 'dns':
                        results.push({
                                status: statusMap[data.startlist[i][1]],
                                intermediate: 99,
                                racer: data.startlist[i][0],
                                time: 0
                            }
                        );
                        break;
                }
            }
        }

        for (let i = 0; i < data.result.length; i++) {
            const res = data.result[i];
            if (res !== null) {
                for (let j = 0; j < res.length; j++) {
                    if (res[j]) {
                        results.push({status: Status.Default, intermediate: data.racedef[j][1], racer: i, time: res[j]});
                    }
                }
            }
        }

        actions.push(initialize({
            intermediates,
            racers,
            startList,
            results
        }));

        this.initialized = true;

        return actions;
    }

    private parseUpdate(data: Update): Action[] {
        const actions: Action[] = [];
        const events: FisEvent[] = [];
        let reload = false;
        let stopUpdating = false;

        if (data.events) {
            data.events.forEach((event) => {
                switch (event[0]) {
                    case 'inter':
                    case 'bonuspoint':
                        if (event[4]) {
                            events.push({
                                type: 'register_result',
                                payload: {status: Status.Default, intermediate: event[3], racer: event[2], time: event[4]}
                            });
                        }
                        break;
                    case 'finish':
                        events.push({
                            type: 'register_result',
                            payload: {status: Status.Finished, intermediate: event[3], racer: event[2], time: event[4]}
                        });
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]]}
                        });
                        break;
                    case 'dnf':
                    case 'dns':
                    case 'dq':
                    case 'ral':
                    case 'lapped':
                        events.push({
                            type: 'register_result',
                            payload: {
                                status: statusMap[event[0]],
                                intermediate: 99,
                                racer: event[2],
                                time: 0
                            }
                        });
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]]}
                        });
                        break;
                    case 'q':
                    case 'nq':
                    case 'lucky':
                    case 'ff':
                    case 'start':
                    case 'nextstart':
                        events.push({
                            type: 'set_status',
                            payload: {id: event[2], status: statusMap[event[0]]}
                        });
                        break;
                    case 'meteo':
                        actions.push(updateMeteo({meteo: {
                                air_temperature: event[1],
                                wind: event[2],
                                weather: event[3],
                                snow_condition: event[4],
                                snow_temperature: event[5],
                                humidity: event[6]
                            }}));
                        break;
                    case 'message':
                        actions.push(setRaceMessage({message: event[1]}));
                        break;
                    case 'reloadmain':
                    case 'reloadflash':
                        reload = true;
                        break;
                    case 'official_result':
                        stopUpdating = true;
                        break;

                    case 'palmier':
                    case 'tds':
                    case 'falsestart':
                    case 'activeheat':
                    default:
                        console.log('Unknown event:', event);
                        break;
                }
            });
        }

        if (events.length > 0) {
            actions.push(update({
                events, isEvent: true, timestamp: Date.now()
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

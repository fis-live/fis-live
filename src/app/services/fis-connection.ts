import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { unserialize } from './unserialize';
import { FisServer } from '../models/fis-server';
import { Action } from '@ngrx/store';
import { catchError, map, switchMap, repeat, timeInterval, timeout } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';
import { TimeInterval } from '../../../node_modules/rxjs/operators/timeInterval';

@Injectable()
export class FisConnectionService {
    private signature: string;
    private updateCount: number = 0;
    private errorCount: number = 0;
    private interval: number = 0;
    private delay: number = 0;

    private codex: number;
    private version: number;

    private baseURL: string = 'http://live.fis-ski.com/';
    private proxy: string = 'https://fislive-cors.herokuapp.com/';

    private server_list: FisServer[] = [];


    private SERVER_LIST_URL: string = 'http://live.fis-ski.com/general/serverList.xml';
    private TIMEOUT: number = 10000;

    constructor(private _http: HttpClient) {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number): void {
        this.codex = codex || this.codex;
        this.version = 0;
        this.delay = 0;
        this.updateCount = 0;
        this.errorCount = 0;
    }

    public setProxy(proxy: string) {
        this.proxy = proxy;
    }

    private getQueryString(): string {
        const d = new Date();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-` + d.getMilliseconds().toString();
    }

    public getServerList(): Observable<FisServer[]> {
        return this._http.get(this.proxy + this.SERVER_LIST_URL, {
            responseType: 'text',
            params: new HttpParams().set('i', this.getQueryString())
        }).pipe(map(res => this.parseServerList(res)));
    }

    public poll(): Observable<any> {
        return of(null).pipe(
            switchMap(() => timer(this.delay).pipe(
                switchMap(() => this.getHttpRequest()),
                map(result => this.parse(result)),
                catchError(error => this.handleError(error))
            )),
            repeat()
        );
    }

    public loadMain(codex: number | null): Observable<any> {
        this.initialize(codex);

        return timer(this.delay).pipe(
            switchMap(() => this.getHttpRequest()),
            map(result => this.parse(result)),
            catchError(error => this.handleError(error))
        );
    }

    private getHttpRequest(): Observable<TimeInterval<string>> {
        let url: string;

        if (this.version === 0) {
            url = `${this.baseURL}${this.codex}/main.xml`;
        } else {
            url = `${this.baseURL}${this.codex}/updt${this.version}.xml`;
        }
        return this._http.get(this.proxy + url, {
            responseType: 'text',
            params: new HttpParams().set('i', this.getQueryString())
        }).pipe(timeInterval());
    }

    private parse(result: TimeInterval<string>): any {
        this.interval = result.interval;
        const data = unserialize(result.value.slice(4, -5));
        if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
            throw new Error('No live information');
        }

        this.delay = data.live[0] * 1000;
        this.version = data.live[1];
        this.updateCount++;
        this.errorCount = 0;

        return data;
    }

    private parseServerList(result: string): FisServer[] {
        const data = unserialize(result.slice(4, -5));
        const servers: any[] = data.servers;

        for (let i = 0; i < servers.length; i++) {
            this.server_list.push({url: servers[i][0], weight: servers[i][1], index: servers[i][2]});
        }

        return this.server_list;
    }

    private handleError(error: any) {
        this.errorCount++;
        if (error instanceof TimeInterval) {
            this.interval = error.interval;
        }

        this.delay = (this.delay > 0) ? this.delay : 1000;

        if (this.errorCount < 10) {
            return (this.version === 0) ? timer(this.delay).pipe(
                switchMap(() => this.getHttpRequest()),
                map(result => this.parse(result)),
                catchError(e => this.handleError(e))
            ) : this.poll();
        }

        const errMsg = (error instanceof Error) ? error :
            (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

        return Observable.throw(errMsg);
    }

    public selectServer(): void {
        let sum = 0;

        for (let i = 0; i < this.server_list.length; i++) {
            sum += this.server_list[i].weight;
        }

        let urlServer: string = null;

        const r = Math.random() * sum;
        let partialSum = 0;
        let j = 0;
        while (urlServer == null && partialSum <= r) {
            partialSum += this.server_list[j].weight;

            if (r < partialSum) {
                urlServer = this.server_list[j].url;
            }

            j++;
        }

        this.baseURL = `http://${urlServer}/`;
    }

    public loadPdf(doc: string): Observable<Action[]> {
        return this._http.get<Action[]>(`${this.proxy}pdf.json?codex=${this.codex}&doc=${doc}`)
            .pipe(catchError((error) => {
                const errMsg = (error instanceof Error) ? error :
                    (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

                return Observable.throw(errMsg);
            }), timeout(10000));
    }
}

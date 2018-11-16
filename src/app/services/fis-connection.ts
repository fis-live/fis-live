import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { defer, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, repeat, retry, switchMap, timeout } from 'rxjs/operators';

import { Main, ServerList, Update } from '../fis/models';
import { FisServer } from '../models/fis-server';
import { Race } from '../models/race';

import { unserialize } from './unserialize';

@Injectable()
export class FisConnectionService {
    private signature: string;
    private updateCount: number = 0;
    private errorCount: number = 0;
    private interval: number = 0;
    private delay: number = 0;
    private startRequest: number;

    private codex: number;
    private version: number;

    private baseURL: string = 'http://live.fis-ski.com/mobile/';
    private proxy: string = 'https://fislive-cors.herokuapp.com/';

    private server_list: FisServer[] = [];


    private SERVER_LIST_URL: string = 'http://live.fis-ski.com/general/serverList.json';
    private TIMEOUT: number = 10000;

    constructor(private _http: HttpClient) {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number | null): void {
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
        this.startRequest = d.getTime();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-` + d.getMilliseconds().toString();
    }

    public getServerList(): Observable<FisServer[]> {
        return this._http.get<ServerList>(this.proxy + this.SERVER_LIST_URL, {
            params: new HttpParams().set('i', this.getQueryString())
        }).pipe(map(res => this.parseServerList(res)));
    }

    public poll(): Observable<Update> {
        return of(null).pipe(
            switchMap(() => timer(this.delay)),
            switchMap(() => this.getHttpRequest()),
            timeout(this.TIMEOUT),
            map(result => (<Update> this.parse(result))),
            catchError(error => this.handleError(error)),
            retry(10),
            repeat()
        );
    }

    public loadMain(codex: number | null): Observable<Main> {
        this.initialize(codex);

        return defer(() => timer(this.delay)).pipe(
            switchMap(() => this.getHttpRequest()),
            timeout(this.TIMEOUT),
            map(result => (<Main> this.parse(result))),
            catchError(error => this.handleError(error)),
            retry(10),
        );
    }

    private getHttpRequest(): Observable<string> {
        let url: string;
        if (this.version === 0) {
            url = `${this.baseURL}mobile/cc-${this.codex}/main.xml`;
        } else {
            url = `${this.baseURL}mobile/cc-${this.codex}/updt${this.version}.xml`;
        }
        return this._http.get(this.proxy + url, {
            responseType: 'text',
            params: new HttpParams().set('i', this.getQueryString())
        });
    }

    private parse(result: string): Main | Update {
        this.interval = Date.now() - this.startRequest;
        const data = unserialize(result.slice(4, -5)) as Main | Update;
        if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
            throw new Error('No live information');
        }

        this.delay = data.live[0] * 1000;
        this.version = data.live[1];
        this.updateCount++;
        this.errorCount = 0;

        return data;
    }

    private parseServerList(result: ServerList): FisServer[] {
        this.interval = Date.now() - this.startRequest;

        for (const server of result.servers) {
            this.server_list.push({url: server[0], weight: server[1], index: server[2]});
        }

        return this.server_list;
    }

    private handleError(error: HttpErrorResponse) {
        this.errorCount++;
        this.interval = Date.now() - this.startRequest;

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

    public loadPdf(doc: string): Observable<Action[]> {
        return this._http.get<Action[]>(`${this.proxy}pdf.json?codex=${this.codex}&doc=${doc}`).pipe(timeout(this.TIMEOUT));
    }
}

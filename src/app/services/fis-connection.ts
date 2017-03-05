import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, TimeInterval } from 'rxjs/Rx';

import { unserialize } from './unserialize';
import { ErrorTimeInterval } from './operator/timeoutInterval';
import { FisServer } from '../models/fis-server';
import { Action } from '@ngrx/store';

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

    constructor(private _http: Http) {
        const d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number): void {
        this.codex = codex || this.codex;
        this.version = 0;
        this.delay = 0;
        this.updateCount = 0;
    }

    public setProxy(proxy: string) {
        this.proxy = proxy;
    }

    private getQueryString(): string {
        const d = new Date();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-` + d.getMilliseconds().toString();
    }

    public getServerList(): Observable<FisServer[]> {
        return this._http.get(this.proxy + this.SERVER_LIST_URL, {search: 'i=' + this.getQueryString()})
            .map(res => this.parseServerList(res));
    }

    public poll(): Observable<any> {
        return Observable.timer(this.delay).switchMap(() => this.getHttpRequest())
            .map(result => this.parse(result))
            .catch(error => this.handleError(error));
    }

    public loadMain(codex: number | null): Observable<any> {
        this.initialize(codex);

        return this.poll();
    }

    private getHttpRequest(): Observable<TimeInterval<Response>> {
        let url: string;

        if (this.version === 0) {
            url = `${this.baseURL}${this.codex}/main.xml`;
        } else {
            url = `${this.baseURL}${this.codex}/updt${this.version}.xml`;
        }
        return this._http.get(this.proxy + url, {search: 'i=' + this.getQueryString()})
            .timeoutInterval(this.TIMEOUT);
    }

    private parse(result: TimeInterval<Response>): any {
        this.interval = result.interval;
        const data = unserialize(result.value.text().slice(4, -5));
        if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
            throw new Error('No live information');
        }

        this.delay = data.live[0] * 1000;
        this.version = data.live[1];
        this.updateCount++;
        this.errorCount = 0;

        return data;
    }

    private parseServerList(result: any): FisServer[] {
        const data = unserialize(result.text().slice(4, -5));
        const servers: any[] = data.servers;

        for (let i = 0; i < servers.length; i++) {
            this.server_list.push({url: servers[i][0], weight: servers[i][1], index: servers[i][2]});
        }

        return this.server_list;
    }

    private handleError(error: any) {
        this.errorCount++;
        if (error instanceof ErrorTimeInterval) {
            this.interval = error.interval;
            error = error.error;
        }

        this.delay = (this.delay > 0) ? this.delay : 1000;

        if (this.errorCount < 10) {
            return this.poll();
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
        let i = 0;
        while (urlServer == null && partialSum <= r) {
            partialSum += this.server_list[i].weight;

            if (r < partialSum) {
                urlServer = this.server_list[i].url;
            }

            i++;
        }

        this.baseURL = `http://${urlServer}/`;
    }

    loadPdf(doc: number): Observable<Action[]> {
        return this._http.get(`${this.proxy}pdf.json?codex=${this.codex}&doc=${doc}`)
            .map((response) => response.json())
            .catch((error) => {
                const errMsg = (error instanceof Error) ? error :
                    (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

                return Observable.throw(errMsg);
            })
            .timeout(10000);
    }
}

import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";

import { unserialize, json } from './unserialize';
import { ErrorTimeInterval } from "./operator/timeoutInterval";

import { Observable, TimeInterval } from "rxjs/Rx";

import { FisServer } from "./fis-server";

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
    
    private server_list: FisServer[] = [];


    private SERVER_LIST_URL: string = 'http://live.fis-ski.com/general/serverList.xml';
    private TIMEOUT: number = 10000;

    constructor(private http: Http) {
        let d = new Date();
        this.signature = d.getSeconds().toString() + d.getMilliseconds().toString() + '-fis';
    }

    public initialize(codex: number): void {
        this.codex = codex || this.codex;
        this.version = 0;
        this.delay = 0;
        this.updateCount = 0;
    }
    

    private getQueryString(): string {
        let d = new Date();
        return `${this.interval}-${this.errorCount}-${this.signature}-${this.updateCount}-` + d.getMilliseconds().toString();
    }

    public getServerList(): Observable<FisServer[]>{
        return this.http.get(this.SERVER_LIST_URL, {search: 'i=' + this.getQueryString()})
            .map(res => this.parseServerList(res));
    }

    public poll(payload: number | null = null): Observable<any> {
        if (payload) {
            this.initialize(payload);
        }

        return Observable.timer(this.delay).switchMap(() => this.getHttpRequest())
            .map(result => this.parse(result))
            .catch(error => this.handleError(error));
    }

    private getHttpRequest(): Observable<TimeInterval<Response>> {
        var url: string;
        
        if (this.version === 0) {
            url = `${this.baseURL}${this.codex}/main.xml`;
        } else {
            url = `${this.baseURL}${this.codex}/updt${this.version}.xml`;
        }
        return this.http.get(url, {search: 'i=' + this.getQueryString()})
            .timeoutInterval(this.TIMEOUT);
    }

    private parse(result: TimeInterval<Response>): any {
        this.interval = result.interval;
        let data = json(unserialize(result.value.text().slice(4, -5)));
        if (!data.live || isNaN(data.live[1]) || isNaN(data.live[0])) {
            throw new Error('No live information');
        }

        this.delay = data.live[0]*1000;
        this.version = (this.version > 0 && data.live[1] > this.version + 10) ? this.version + 10: data.live[1];
        this.updateCount++;
        this.errorCount = 0;

        return data;
    }

    private parseServerList(result: any): FisServer[] {
        let data = json(unserialize(result.text().slice(4, -5)));
        var servers: any[] = data.servers;
        for (let i = 0; i < servers.length; i++) {
            this.server_list.push(new FisServer(servers[i][0], servers[i][1], servers[i][2]));
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

        let errMsg = (error instanceof Error) ? error : (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

        return Observable.throw(errMsg);
    }

    public selectServer(): void {
        var sum: number = 0;

        for (var i = 0; i < this.server_list.length; i++) {
            sum += this.server_list[i].weight;
        }

        var urlServer: string = null;

        var r = Math.random() * sum;
        var partialSum = 0;
        var i = 0;
        while (urlServer == null && partialSum <= r) {
            partialSum += this.server_list[i].weight;

            if (r < partialSum) {
                urlServer = this.server_list[i].url;
            }

            i++;
        }

        this.baseURL = `http://${urlServer}/`;
    }
}
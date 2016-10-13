import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from "@ngrx/store";

import { TableConfig } from './components/table/table.component';
import { AppState, getIntermediates, getResultState, getRacers } from "./reducers";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import { Racer } from "./models/racer";

export interface ResultItem {
    racer: Racer;
    time: number;
    order: number;
    status: string;
    rank: number;
    fastest: number;
    state: string;
}

@Component({
    selector: 'app-tab',
    template: `<app-dropdown [id]="id" [items]="intermediates | async" (selected)="onChange($event)"></app-dropdown>
        <div class="ui attached segment">
        <app-table [config]="config" [rows]="rows$ | async"></app-table>
            </div>`
})
export class RaceTabComponent implements OnDestroy {

    ngOnDestroy() {
        console.log('Destroy' + this.id);
    }

    @Input() public id: string;
    public intermediate: number | string = 'start_list';

    public intermediates: Observable<any>;
    public rows$: Observable<Array<ResultItem>>;

    private filter: Subject<any> = new BehaviorSubject<any>('start_list');
    
    private maxVal: number = 1000000000;

    public config: TableConfig = {
        isStartList: true
    };

    constructor (private _state: Store<AppState>) {
        this.intermediates = _state.let(getIntermediates);

        this.rows$ = Observable.combineLatest(_state.let(getResultState), _state.let(getRacers), this.filter.distinctUntilChanged())
            .map(([results, racers, filter]) => {
                if (filter == 'start_list') {
                    let count = results.startList.length;
                    return results.startList.map((res, index) => ({
                            racer: racers[res.racer],
                            fastest: 0,
                            time: 0,
                            order: res.order,
                            status: res.status,
                            rank: 0,
                            state: (count - index < 4) ? 'new' : ''
                        })
                    );
                }

                let count = results.startList.length;
                let rows = new Array<ResultItem>();
                // for (let i = 0; i < count; i++) {
                //     let status = results.startList[i].status.toLowerCase();
                //     let key: number;
                //     switch (status) {
                //         case "":
                //         case "finish":
                //         case "start":
                //         case "ff":
                //         case "q":
                //         case "lucky":
                //             break;
                //         case "ral":
                //             key = this.maxVal + 1;
                //             break;
                //         case "lapped":
                //             key = this.maxVal * 2;
                //             break;
                //         case "dnf":
                //             key = this.maxVal * 3;
                //             break;
                //         case "dq":
                //             key = this.maxVal * 4;
                //             break;
                //         case "dns":
                //             key = this.maxVal * 5;
                //             break;
                //         default:
                //             key = this.maxVal * 6;
                //     }
                //
                //     if (key > 0) {
                //         rows.push({racer: racers[results.startList[i].racer], fastest: 0, time: key, order: 0, status: results.startList[i].status, rank: null})
                //     }
                // }
                if (results[filter] == null) {
                    return rows;
                }

                let fastest = results[filter].fastest;
                count = results[filter].entities.length;

                return rows.concat(results[filter].entities.map((res, index) => ({state: (count - index < 4) ? 'new' : '', racer: racers[res.racer], fastest: fastest, time: res.time, order: 0, status: '', rank: res.rank})));
            });
    }

    public onChange($event: any) {
        if (this.intermediate != $event) {
            if (this.intermediate != 'start_list' && $event == 'start_list') {
                this.config.isStartList = true;
            }

            if (this.intermediate == 'start_list') {
                this.config.isStartList = false;
            }

            this.intermediate = $event;

            this.filter.next($event);
        }
    }
}
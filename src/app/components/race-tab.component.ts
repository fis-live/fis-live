import { Component } from '@angular/core';
import { Store } from "@ngrx/store";

import { AppState, getIntermediates, getResultState, getRacers } from "../reducers";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { Racer } from "../models/racer";

export interface ResultItem {
    racer: Racer;
    time: number;
    order: number;
    status: string;
    color: string;
    rank: number;
    fastest: number;
    state: string;
    diff: number;
}

@Component({
    selector: 'app-tab',
    template: `<app-dropdown [items]="intermediates | async" (selected)="onChange($event)"></app-dropdown>
        <div class="ui attached segment">
        <app-table [isStartList]="config" [rows]="rows$ | async"></app-table>
            </div>`
})
export class RaceTabComponent {

    public intermediate: number = 0;

    public intermediates: Observable<any>;
    public rows$: Observable<Array<ResultItem>>;

    private filter: Subject<{inter: number, compare: number}> = new BehaviorSubject<{inter: number, compare: number}>({inter: 0, compare: null});
    
    private maxVal: number = 1000000000;

    public config: boolean = true;

    constructor (private _state: Store<AppState>) {
        this.intermediates = _state.let(getIntermediates);

        this.rows$ = Observable.combineLatest(_state.let(getResultState), _state.let(getRacers), this.filter.distinctUntilChanged())
            .map(([results, racers, inter]) => {
                let filter = inter.inter;

                if (filter === 0) {
                    return results.startList.map((res, index) => ({
                            racer: racers[res.racer],
                            fastest: 0,
                            time: 0,
                            order: res.order,
                            color: res.color,
                            status: res.status,
                            rank: 0,
                            diff: res.time,
                            state: ''
                        })
                    );
                }

                let count = results.startList.length;
                let fromStartList = [];
                for (let i = 0; i < count; i++) {
                    let status = results.startList[i].status.toLowerCase();
                    let key = 0;
                    switch (status) {
                        case "":
                        case "finish":
                        case "start":
                        case "ff":
                        case "q":
                        case "lucky":
                        case "nextstart":
                            break;
                        case "ral":
                            key = this.maxVal + 1;
                            break;
                        case "lapped":
                            key = this.maxVal * 2;
                            break;
                        case "dnf":
                            key = this.maxVal * 3;
                            break;
                        case "dq":
                            key = this.maxVal * 4;
                            break;
                        case "dns":
                            key = this.maxVal * 5;
                            break;
                        default:
                            key = this.maxVal * 6;
                    }

                    if (key > 0 || results.startList[i].color !== null || results.startList[i].time !== null) {
                        fromStartList[results.startList[i].racer] = {
                            racer: racers[results.startList[i].racer],
                            fastest: 0,
                            time: key,
                            order: 0,
                            status: results.startList[i].status,
                            rank: null,
                            color: results.startList[i].color,
                            diff: results.startList[i].time,
                            state: ''
                        };
                    }
                }

                if (results[filter] == null) {
                    return fromStartList.filter(row => row && row.time > 0);
                }

                let fastest = results[filter].fastest;
                count = results[filter].entities.length;
                let comp = [];
                if (inter.compare > 0) {
                    results[inter.compare].entities.forEach((item) => comp[item.racer] = item.time);
                }

                let rows = [];
                results[filter].entities.forEach((row, index) => {
                    let color = null;
                    let compareTime = null;
                    if (fromStartList[row.racer]) {
                        color = fromStartList[row.racer].color;
                        if (inter.compare === 0) {
                            compareTime = fromStartList[row.racer].diff;
                        }

                        fromStartList[row.racer] = undefined;
                    }

                    if (comp[row.racer]) {
                        compareTime = comp[row.racer];
                    }

                    rows.push({
                        state: (count - index < 4) ? 'new' : '',
                        racer: racers[row.racer],
                        fastest: fastest,
                        color: color,
                        time: row.time,
                        order: 0,
                        status: '',
                        rank: row.rank,
                        diff: compareTime !== null ? row.time - compareTime : null
                    })
                });

                return rows.concat(fromStartList.filter(row => row && row.time > 0));
            });
    }

    public onChange($event: {inter: number, compare: number}) {
        if (this.intermediate !== $event.inter) {
            if (this.intermediate !== 0 && $event.inter === 0) {
                this.config = true;
            }

            if (this.intermediate === 0) {
                this.config = false;
            }

            this.intermediate = $event.inter;
        }

        this.filter.next($event);
    }
}
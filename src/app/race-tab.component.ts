import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from "@ngrx/store";

import { TableConfig } from './components/table/table.component';
import { AppState, getIntermediates, getResultState, getRacers } from "./reducers";
import { Observable, Subject } from "rxjs";
import { Racer } from "./models/racer";

export interface ResultItem {
    racer: Racer;
    time: number;
    order: number;
    status: string;
    rank: number;
    fastest: number;
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
    public intermediate: number = 0;

    public intermediates: Observable<any>;
    public rows$: Observable<Array<ResultItem>>;

    private filter: Subject<any> = new Subject<any>();

    public config: TableConfig = {
        isStartList: true
    };

    constructor (private _state: Store<AppState>) {
        this.intermediates = _state.let(getIntermediates);

        this.rows$ = Observable.combineLatest(_state.let(getResultState), _state.let(getRacers), this.filter.distinctUntilChanged())
            .map<Array<ResultItem>>(([results, racers, filter]) => {
                if (results[filter] == null) {
                    return [];
                }

                let fastest = results[filter].fastest;
                return results[filter].entities.map(res => ({racer: racers[res.racer], fastest: fastest, time: res.time, order: 0, status: '', rank: res.rank}));
            });
    }

    public onChange($event: any) {
        if (this.intermediate != $event) {
            if (this.intermediate != 0 && $event == 0) {
                this.config.isStartList = true;
            }

            if (this.intermediate == 0) {
                this.config.isStartList = false;
            }

            this.intermediate = $event;

            this.filter.next($event);
        }
    }
}
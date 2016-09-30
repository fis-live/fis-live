import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from "@ngrx/store";

import { TableConfig, Sort } from './components/table/table.component';
import {AppState, getIntermediates, getResultState, getRacers} from "./reducers";
import {Observable, Subject, Subscription} from "rxjs";
import {Racer} from "./models/racer";

@Component({
    selector: 'app-tab',
    template: `<app-dropdown [id]="id" [items]="intermediates | async" (selected)="onChange($event)"></app-dropdown>
        <div class="ui attached segment">
        <app-table [config]="config" [rows]="rows" (sortChanged)="sort($event)"></app-table>
            </div>`
})
export class RaceTabComponent implements OnDestroy {
    ngOnDestroy() {
        console.log('Destroy' + this.id);
    }
    public codex;
    public run: number;
    public intermediate: number;

    public intermediates: any;
    public results$: Subscription;

    private filter: Subject<any> = new Subject<any>();

    constructor (private _state: Store<AppState>) {
        this.intermediates = _state.let(getIntermediates);
        this.results$ = Observable.combineLatest(_state.let(getResultState), _state.let(getRacers), this.filter)
            .map(([results, racers, filter]) => {
                return {racers: racers, results: results.filter(r => r.intermediate == filter)};
            }).subscribe(val => this.handle(val));
    }

    private handle(val) {
        val.results.forEach(res => this.rows.push({rank: 0, bib: val.racers[res.racer].bib,
            name: val.racers[res.racer].fullName,
            time: res.time,
            nationality: val.racers[res.racer].nationality}));
    }



    private _start_list_columns = [{sort: '', name:'order', title:'Order', sortable: true},
        {sort: '', name:'bib', title:'Bib', sortable: true},
        {sort: '', name:'name', title:'Name', sortable: true},
        {sort: '', name:'status', title:'Status', sortable: true},
        {sort: '', name:'nationality', title:'Nationality', sortable: true}
    ];

    private _intermediate_columns = [{sort: '', name:'rank', title:'Rank', sortable: false},
        {sort: '', name:'bib', title:'Bib', sortable: true},
        {sort: '', name:'name', title:'Name', sortable: true},
        {sort: '', name:'time', title:'Time', sortable: true},
        {sort: '', name:'nationality', title:'Nationality', sortable: true}
    ];

    private config: TableConfig = {
        sortable: true,
        columns: this._start_list_columns,
    };

    private rows: any = [];

    @Input()
    public id: string;

    public onChange($event: any) {
        this.filter.next($event);
        if (this.intermediate != $event) {
            if (this.intermediate != 0 && $event == 0) {
                this.config.columns = this._start_list_columns;
            }

            if (this.intermediate == 0) {
                this.config.columns = this._intermediate_columns;
            }

            this.intermediate = $event;
        }
    }

    public sort($event: Sort): void {
        switch ($event.sortOrder) {
            case 'asc':
                this.rows.sort((a, b) => a[$event.sortBy] > b[$event.sortBy]);
                break;
            case 'desc':
                this.rows.sort((a, b) => a[$event.sortBy] < b[$event.sortBy]);
                break;
        }
        // this.rows.push({order: 14, bib: 114, name: 'joow', status: 'Finish', nationality: 'SWE'});
    }
}
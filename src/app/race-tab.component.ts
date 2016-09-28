import { Component, Input, OnDestroy } from '@angular/core';
import { RaceModel } from './Model/race-model';
import {TableConfig, Sort} from './Table/table.component';
import {AppState, getIntermediates} from "./reducers/index";
import {Store} from "@ngrx/store";

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

    constructor (private _state: Store<AppState>) {
        this.intermediates = _state.let(getIntermediates);
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
    public raceModel: RaceModel;

    @Input()
    public id: string;

    public onChange($event: any) {
        if (this.intermediate != $event) {
            if (this.intermediate != 0 && $event == 0) {
                this.config.columns = this._start_list_columns;
            }

            if (this.intermediate == 0) {
                this.config.columns = this._intermediate_columns;
            }
            this.intermediate = $event;

            if (this.intermediate == 0) {
                let list = this.raceModel.getStartList();
                list.forEach((entry) => this.rows.push({order: entry.order, bib: entry.racer.bib, name: entry.racer.fullName, status: entry.status, nationality: entry.racer.nationality}));
            }
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
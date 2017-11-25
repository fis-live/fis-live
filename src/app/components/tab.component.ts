import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';

import { maxVal, statusMap, timeToStatusMap } from '../fis/fis-constants';
import { Intermediate } from '../models/intermediate';
import { Racer } from '../models/racer';
import { ResultService } from '../services/result.service';
import { AppState, selectAllIntermediates } from '../state/reducers';
import { RacerData } from '../state/reducers/result';

import {Columns, DatagridState} from './datagrid/providers/datagrid-state';
import {Filters} from './datagrid/providers/filter';
import {Sort} from './datagrid/providers/sort';

export interface ResultItem {
    racer: Racer;
    time: number;
    status: string;
    diff: number;
    rank: number;
}

export interface TableConfiguration {
    isStartList: boolean;
    rows: any[];
    cols: string[];
}

@Component({
    selector: 'app-tab',
    template: `
        <app-grid-header [config]="columns$ | async" [items]="intermediates$ | async" class="action-bar"></app-grid-header>
<div class="segment" appScrollbar>
    <app-table [columns]="columns$ | async" [config]="tableConfig$ | async"></app-table>
</div>`,
    providers: [DatagridState, Filters, Sort],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {

    public intermediates$: Observable<Intermediate[]>;
    public tableConfig$: Observable<TableConfiguration>;
    public columns$: Observable<Columns>;

    @Input() set breakpoint(breakpoint: string) {
        this._state.setBreakpoint(breakpoint);
    }

    constructor(private _store: Store<AppState>, private _state: DatagridState) {
        this.intermediates$ = this._store.select(selectAllIntermediates);

        this.tableConfig$ = this._state.connect();
        this.columns$ = this._state.getVisibleColumns();
    }
}

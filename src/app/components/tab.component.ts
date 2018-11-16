import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { Columns, TableConfiguration } from '../models/table';

import { DatagridState } from './datagrid/providers/datagrid-state';
import { Filters } from './datagrid/providers/filter';
import { Sort } from './datagrid/providers/sort';
import { ViewSelector } from './datagrid/providers/view-selector';
import { APP_OPTIONS } from './select/select';

@Component({
    selector: 'app-tab',
    template: `
        <app-grid-header [config]="columns$ | async" class="action-bar"></app-grid-header>

        <div class="segment" appScrollbar>
            <app-table [breakpoint]="_breakpoint" [columns]="columns$ | async" [config]="tableConfig$ | async"></app-table>
        </div>
    `,
    providers: [DatagridState, Filters, Sort, ViewSelector, { provide: APP_OPTIONS, useExisting: ViewSelector}],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {

    public tableConfig$: Observable<TableConfiguration>;
    public columns$: Observable<Columns>;
    public _breakpoint: string;

    @Input() set breakpoint(breakpoint: string) {
        this._state.setBreakpoint(breakpoint);
        this._breakpoint = breakpoint;
    }

    constructor(private _state: DatagridState) {
        this.tableConfig$ = this._state.connect();
        this.columns$ = this._state.getVisibleColumns();
    }
}

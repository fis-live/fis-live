import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ResultItem } from '../../models/table';
import { APP_OPTIONS } from '../select/select';

import { Config, DatagridConfig } from './providers/config';
import { DatagridState } from './providers/datagrid-state';
import { Filters } from './providers/filter';
import { Sort } from './providers/sort';

@Component({
    selector: 'app-dg-wrapper',
    templateUrl: './datagrid-wrapper.html',
    providers: [DatagridConfig, DatagridState, Filters, Sort, { provide: APP_OPTIONS, useExisting: DatagridConfig}],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridWrapper {
    @Input()
    public dgId: string;

    public config$: Observable<Config>;
    public row$: Observable<ResultItem[]>;

    @Input() set breakpoint(breakpoint: string) {
        this._config.setBreakpoint(breakpoint);
    }

    constructor(private _config: DatagridConfig, private state: DatagridState) {
        this.row$ = this.state.connect();
        this.config$ = this._config.getConfig();
    }
}

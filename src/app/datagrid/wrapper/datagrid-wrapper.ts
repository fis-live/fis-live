import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { APP_OPTIONS } from '../../core/select/select';
import { Config, DatagridConfig } from '../providers/config';
import { DatagridState } from '../providers/datagrid-state';
import { Filters } from '../providers/filter';
import { Sort } from '../providers/sort';

@Component({
    selector: 'app-dg-wrapper',
    templateUrl: './datagrid-wrapper.html',
    providers: [DatagridConfig, DatagridState, Filters, Sort, { provide: APP_OPTIONS, useExisting: DatagridConfig }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridWrapper {
    public config$: Observable<Config>;
    public tickerEnabled$: Observable<boolean>;

    @Input() set breakpoint(breakpoint: string) {
        this._config.setBreakpoint(breakpoint);
    }

    constructor(private _config: DatagridConfig) {
        this.config$ = this._config.getConfig();
        this.tickerEnabled$ = this.config$.pipe(select('tickerEnabled'));
    }
}

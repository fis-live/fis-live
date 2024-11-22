import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { select } from '@ngrx/store';
import { NgScrollbar } from 'ngx-scrollbar';
import { Observable } from 'rxjs';

import { APP_OPTIONS } from '../../core/select/select';
import { Datagrid } from '../datagrid';
import { Filter } from '../filter/filter';
import { DatagridHeader } from '../header/datagrid-header';
import { Sort } from '../sort/sort';
import { DatagridStore } from '../state/datagrid-store';
import { DatagridState } from '../state/model';
import { TableDataSource } from '../state/table-data-source';
import { DatagridTicker } from '../ticker/datagrid-ticker';

@Component({
    selector: 'app-dg-wrapper',
    templateUrl: './datagrid-wrapper.html',
    providers: [DatagridStore, TableDataSource, Filter, Sort, { provide: APP_OPTIONS, useExisting: DatagridStore }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgScrollbar,
        DatagridHeader,
        Datagrid,
        PushPipe,
        DatagridTicker,
    ]
})
export class DatagridWrapper {
    public config$: Observable<DatagridState>;
    public tickerEnabled$: Observable<boolean>;
    public readonly scrollbarDisabled: boolean = true;

    @Input() set breakpoint(breakpoint: string) {
        this._config.setBreakpoint(breakpoint);
    }

    private static getScrollbarWidth() {
        const e = document.createElement('div');
        e.style.position = 'absolute';
        e.style.top = '-9999px';
        e.style.width = '100px';
        e.style.height = '100px';
        e.style.overflow = 'scroll';
        (e.style as any).msOverflowStyle = 'scrollbar';

        document.body.appendChild(e);
        const width = (e.offsetWidth - e.clientWidth);
        document.body.removeChild(e);

        return width;
    }

    constructor(private _config: DatagridStore) {
        if (DatagridWrapper.getScrollbarWidth() > 0) {
            this.scrollbarDisabled = false;
        }

        this.config$ = this._config.state$;
        this.tickerEnabled$ = this.config$.pipe(select('tickerEnabled'));
    }
}

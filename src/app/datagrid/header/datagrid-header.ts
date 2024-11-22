import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LetDirective, PushPipe } from '@ngrx/component';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SelectComponent } from '../../core/select/select';

import { Racer } from '../../fis/cross-country/models';
import { isBonus } from '../../fis/fis-constants';
import { AppState, getResultState, selectAllRacers } from '../../state/reducers';
import { guid } from '../../utils/utils';
import { DatagridSettings } from '../datagrid-settings';
import { DatagridFilter } from '../filter/datagrid-filter';
import { DatagridStore } from '../state/datagrid-store';

@Component({
    selector: 'app-dg-header',
    templateUrl: './datagrid-header.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LetDirective,
        NgIf,
        SelectComponent,
        FormsModule,
        NgForOf,
        PushPipe,
        DatagridFilter,
        DatagridSettings
    ]
})
export class DatagridHeader {
    public readonly guid = guid();

    public readonly racers$: Observable<Racer[]>;
    public readonly progress$: Observable<{ current: number; of: number; } | null>;
    public readonly view$ = this._config.view$;
    public readonly hasDiff$ = this._config.select(this._config.displayedColumns$, (columns) => columns.indexOf('diff') > -1);

    constructor(public _config: DatagridStore, private store: Store<AppState>) {
        this.racers$ = store.pipe(select(selectAllRacers));

        this.progress$ = this._config.view$.pipe(
            switchMap((view) => {
                if (view.mode === 'normal' && view.inter !== null && view.inter.type !== 'start_list' && !isBonus(view.inter)) {
                    return store.pipe(
                        select(getResultState),
                        map((state) => {
                            if (state.standings[view.inter!.key] !== undefined) {
                                return {
                                    current: state.standings[view.inter!.key].ids.length,
                                    of: state.ids.length
                                };
                            }

                            return null;
                        })
                    );
                }

                return of(null);
            })
        );
    }

    public toggleMode(checked: boolean) {
        this._config.setMode(checked ? 'analysis' : 'normal');
    }

    public setDisplayMode(display: 'total' | 'diff') {
        this._config.setDisplayMode(display);
    }

    public setZero(bib: string) {
        this._config.setZero(parseInt(bib, 10));
    }
}

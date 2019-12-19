import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Racer } from '../../models/racer';
import { ResultItem } from '../../models/table';
import { AppState, getResultState, selectAllRacers } from '../../state/reducers';
import { guid } from '../../utils/utils';
import { Config, DatagridConfig } from '../providers/config';

@Component({
    selector: 'app-dg-header',
    templateUrl: './datagrid-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeader {
    public readonly guid = guid();

    public readonly racers$: Observable<Racer[]>;
    public readonly progress$: Observable<{ current: number; of: number; } | null>;
    public readonly config$: Observable<Config> = this._config.getConfig();
    public readonly racerNames$: Observable<string[]>;
    public readonly nations$: Observable<string[]>;

    private static onlyUnique<T>(value: T, index: number, self: T[]) {
        return self.indexOf(value) === index;
    }

    public filterByName = (data: ResultItem) => data.racer.value;
    public filterByNsa = (data: ResultItem) => data.racer.nsa;

    constructor(private _config: DatagridConfig, private store: Store<AppState>) {
        this.racers$ = store.pipe(select(selectAllRacers));
        this.racerNames$ = this.racers$.pipe(
            map((racers) => racers.map((racer) => racer.lastName + ', ' + racer.firstName))
        );
        this.nations$ = this.racers$.pipe(
            map((racers) => racers.map((racer) => racer.nsa).filter(DatagridHeader.onlyUnique))
        );

        this.progress$ = this._config.getConfig().pipe(
            select('view'),
            switchMap((view) => {
                if (view.mode === 'normal' && view.inter !== null && view.inter.type !== 'start_list') {
                    return store.pipe(
                        select(getResultState),
                        map((state) => {
                            return {
                                current: state.standings[view.inter!.key].ids.length,
                                of: state.ids.length
                            };
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

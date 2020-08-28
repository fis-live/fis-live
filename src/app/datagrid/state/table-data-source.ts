import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AppState, selectView } from '../../state/reducers';
import { Filter } from '../filter/filter';
import { Sort } from '../sort/sort';

import { DatagridStore } from './datagrid-store';
import { ResultItem } from './model';

@Injectable()
export class TableDataSource extends DataSource<ResultItem> {

    private readonly _data: Observable<ResultItem[]>;

    constructor(private _sort: Sort, private _filter: Filter<ResultItem>, private store: Store<AppState>, private _config: DatagridStore) {
        super();
        this._sort.comparator = 'rank';

        this._data = this._config.view$.pipe(
            switchMap(view => store.pipe(selectView(view)))
        );
    }

    public connect(): Observable<ResultItem[]> {
        return combineLatest([
            this._data,
            this._sort.change,
            this._filter.change
        ]).pipe(
            map(([rows]) => {
                if (this._filter.hasActiveFilters()) {
                    rows = rows.filter((row) => this._filter.accepts(row, ['racer.nsa', 'racer.value']));
                }

                if (rows != null && this._sort.comparator) {
                    rows = rows.slice().sort((a, b) => this._sort.compare(a, b));
                }

                return rows;
            })
        );
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // TODO: ?
    }
}

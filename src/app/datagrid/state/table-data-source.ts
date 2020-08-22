import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AppState, selectView } from '../../state/reducers';
import { Filters } from '../providers/filter';
import { Sort } from '../providers/sort';

import { DatagridStore } from './datagrid-store';
import { ResultItem } from './model';

@Injectable()
export class TableDataSource extends DataSource<ResultItem> {

    private readonly _data: Observable<ResultItem[]>;

    constructor(private _sort: Sort, private _filters: Filters, private store: Store<AppState>, private _config: DatagridStore) {
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
            this._filters.change
        ]).pipe(
            map(([rows]) => {
                if (this._filters.hasActiveFilters()) {
                    rows = rows.filter((row) => this._filters.accepts(row));
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

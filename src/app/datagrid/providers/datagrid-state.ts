import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ResultItem } from '../../models/table';
import { AppState, selectView } from '../../state/reducers';

import { DatagridStore } from './config';
import { Filters } from './filter';
import { Sort } from './sort';

@Injectable()
export class DatagridState implements DataSource<ResultItem> {

    private readonly view: Observable<ResultItem[]>;

    constructor(private _sort: Sort, private _filters: Filters, private store: Store<AppState>, private _config: DatagridStore) {
        this._sort.comparator = 'rank';

        this.view = this._config.view$.pipe(
            switchMap(view => store.pipe(selectView(view)))
        );
    }

    public connect(): Observable<ResultItem[]> {
        return combineLatest([
            this.view,
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

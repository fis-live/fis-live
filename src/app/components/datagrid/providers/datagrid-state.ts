import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Columns, ResultItem, TableConfiguration } from '../../../models/table';
import { AppState } from '../../../state/reducers';
import { createViewSelector } from '../../../state/reducers/result';

import { Filters } from './filter';
import { Sort } from './sort';
import { ViewSelector } from './view-selector';

@Injectable()
export class DatagridState {
    private _columns: BehaviorSubject<Columns>;
    private _visibleColumns: Columns = {
        bib: true,
        nationality: true,
        diff: true
    };

    private view: Observable<ResultItem[]>;
    private isStartList: boolean;

    constructor(private _sort: Sort, private _filters: Filters, private store: Store<AppState>, private _viewSelector: ViewSelector) {
        this._columns = new BehaviorSubject(this._visibleColumns);
        this._sort.comparator = 'rank';
        this.view = this._viewSelector.getValueChanged().pipe(
            switchMap((view) => {
                this.isStartList = view.inter === null ? true : view.inter.key === 0;
                return this.store.pipe(createViewSelector({
                    inter: view.inter === null ? null : view.inter.key,
                    diff: view.diff === null ? null : view.diff.key
                }));
            })
        );
    }

    public connect(): Observable<TableConfiguration> {
        return combineLatest(
            this.view,
            this._sort.change,
            this._filters.change
        ).pipe(
            map(([rows]) => {
                if (this._filters.hasActiveFilters()) {
                    rows = rows.filter((row) => this._filters.accepts(row));
                }

                if (rows != null && this._sort.comparator) {
                    rows = rows.slice().sort((a, b) => this._sort.compare(a, b));
                }

                return {
                    rows: rows,
                    isStartList: this.isStartList
                };
            })
        );
    }

    public getVisibleColumns(): Observable<Columns> {
        return this._columns.asObservable();
    }

    public toggleColumn(column: keyof Columns) {
        this._visibleColumns[column] = !this._visibleColumns[column];
        this._columns.next({...this._visibleColumns});
    }

    public setBreakpoint(breakpoint: string) {
        if (breakpoint === 'large') {
            this._visibleColumns.bib = true;
            this._visibleColumns.nationality = true;
            this._visibleColumns.diff = true;
        } else if (breakpoint === 'small') {
            this._visibleColumns.bib = true;
            this._visibleColumns.nationality = false;
            this._visibleColumns.diff = true;
        } else {
            this._visibleColumns.bib = false;
            this._visibleColumns.nationality = false;
            this._visibleColumns.diff = false;
        }

        this._columns.next({...this._visibleColumns});
    }
}

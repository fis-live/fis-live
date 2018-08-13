import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Columns, TableConfiguration } from '../../../models/table';
import { AppState } from '../../../state/reducers';
import { createViewSelector } from '../../../state/reducers/result';

import { Filters } from './filter';
import { Sort } from './sort';

@Injectable()
export class DatagridState {
    private _columns: BehaviorSubject<Columns>;
    private _visibleColumns: Columns = {
        bib: true,
        nationality: true,
        diff: true
    };

    public inter: number;
    public diff: number;

    private view: Subject<{inter: number, diff: number}> = new Subject<{inter: number, diff: number}>();

    constructor(private _sort: Sort, private _filters: Filters, private store: Store<AppState>) {
        this._columns = new BehaviorSubject(this._visibleColumns);
        this._sort.comparator = 'rank';
    }

    public connect(): Observable<TableConfiguration> {
        return combineLatest(
            this.view.pipe(switchMap((view) => this.store.pipe(createViewSelector(view)))),
            this._sort.change,
            this._filters.change
        ).pipe(
            map(([rows]) => {
                console.log('trigger refresh');

                if (this._filters.hasActiveFilters()) {
                    rows = rows.filter((row) => this._filters.accepts(row));
                }

                if (rows != null && this._sort.comparator) {
                    rows = rows.slice().sort((a, b) => this._sort.compare(a, b));
                }

                return {
                    rows: rows,
                    isStartList: (this.inter === 0)
                };
            })
        );
    }

    public getVisibleColumns(): Observable<Columns> {
        return this._columns.asObservable();
    }

    public setInter(inter: number): void {
        this.inter = inter;
        if (this.diff >= inter) {
            this.diff = null;
        }
        this.view.next({inter: this.inter, diff: this.diff});
    }

    public setDiff(diff: number): void {
        this.diff = diff;
        this.view.next({inter: this.inter, diff: this.diff});
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

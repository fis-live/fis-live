import {Injectable, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ResultService } from '../../../services/result.service';

import { Filters } from './filter';
import { Sort } from './sort';
import { ResultItem } from '../../tab.component';
import { Subscription } from 'rxjs/Subscription';
import {maxVal, statusMap, timeToStatusMap} from '../../../fis/fis-constants';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export interface Columns {
    bib: boolean;
    nationality: boolean;
    diff: boolean;
}

@Injectable()
export class DatagridState implements OnDestroy {
    private _change: BehaviorSubject<any> = new BehaviorSubject<any>({rows: [], isStartList: 1, cols: ['bib']});
    private _columns: BehaviorSubject<Columns>;
    private _visibleColumns: Columns = {
        bib: false,
        nationality: true,
        diff: true
    };
    private _rows: ResultItem[] = [];
    private _subscriptions: Subscription[] = [];

    public inter: number;
    public diff: number;

    constructor(private _results: ResultService, private _sort: Sort, private _filters: Filters) {
        this._columns = new BehaviorSubject(this._visibleColumns);
        this._sort.comparator = 'rank';
        this._subscriptions = [];
        this._subscriptions.push(this._sort.change.subscribe(() => this.triggerRefresh()));
        this._subscriptions.push(this._filters.change.subscribe(() => this.triggerRefresh()));
        this._subscriptions.push(this._results.change.subscribe(() => this.parseRows()));
    }

    private parseRows() {
        const rows = [];
        let fastestTime: number = maxVal;
        let fastestDiff: number = maxVal;

        const count = this._results.rows.length;
        for (let i = 0; i < count; i++) {
            const row = this._results.rows[i];
            if (row.times[this.inter] !== undefined) {
                fastestDiff = (row.diffs[this.inter][this.diff] < fastestDiff) ? row.diffs[this.inter][this.diff] : fastestDiff;
                fastestTime = (row.times[this.inter].time < fastestTime) ? row.times[this.inter].time : fastestTime;
                rows.push({
                    state: '',
                    racer: row.racer,
                    time: this.inter === 0 ? row.status : row.times[this.inter].time,
                    time_sort: this.inter === 0 ? row.status : row.times[this.inter].time,
                    rank: row.times[this.inter].rank,
                    diff: row.diffs[this.inter][this.diff],
                    diff_sort: row.diffs[this.inter][this.diff],
                    name: row.racer.lastName + ', ' + row.racer.firstName
                });
            }
        }

        if (rows.length > 0) {
            this._rows = rows.map((row) => {
                if (this.inter !== 0) {
                    if (row.time > maxVal) {
                        row.time = timeToStatusMap[row.time];
                    } else if (row.rank > 1) {
                        row.time = '+' + this.formatTime(row.time - fastestTime);
                    } else {
                        row.time = this.formatTime(row.time);
                    }
                } else {
                    row.time = statusMap[row.time] || row.time.toUpperCase();
                }

                if (this.diff !== null && row.diff < maxVal) {
                    if (row.diff === fastestDiff) {
                        row.diff = this.formatTime(row.diff);
                    } else {
                        row.diff = '+' + this.formatTime(row.diff - fastestDiff);
                    }
                } else {
                    row.diff = '';
                }

                return row;
            });
            this.triggerRefresh();
        } else {
            this._rows = [];
            this._change.next({
                rows: [],
                isStartList: (this.inter === 0),
                cols: this._visibleColumns
            });
        }
    }


    public formatTime(time: number): string {
        if (time === null) {
            return '';
        }
        let timeStr = '';

        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
        const seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
        const tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);
        const hundreds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000 - tenths * 100) / 10);

        if (hours > 0 || minutes > 0) {
            if (hours > 0) {
                timeStr = hours + ':';
                if (minutes < 10) {
                    timeStr += '0';
                }
            }
            timeStr += minutes + ':';
            if (seconds < 10) {
                timeStr += '0';
            }
        }

        timeStr += seconds + '.' + tenths;
        timeStr += (hundreds > 0) ? hundreds : '';

        return timeStr;
    }

    private triggerRefresh() {
        let rows = this._rows;

        if (this._filters.hasActiveFilters()) {
            rows = this._rows.filter((row) => this._filters.accepts(row));
        }

        if (rows != null && this._sort.comparator) {
            rows.sort((a, b) => this._sort.compare(a, b));
        }

        this._change.next({
            rows: rows,
            isStartList: (this.inter === 0),
            cols: this._visibleColumns
        });
    }

    public connect(): Observable<any> {
        return this._change.asObservable();
    }

    public getVisibleColumns(): Observable<Columns> {
        return this._columns.asObservable();
    }

    public setInter(inter: number): void {
        this.inter = inter;
        if (this.diff >= inter) {
            this.diff = null;
        }
        this.parseRows();
    }

    public setDiff(diff: number): void {
        this.diff = diff;
        this.parseRows();
    }

    public toggleColumn(column: keyof Columns) {
        this._visibleColumns[column] = !this._visibleColumns[column];
        this._columns.next({...this._visibleColumns});
    }

    public setBreakpoint(breakpoint: string) {
        if (breakpoint === 'large') {
            //this._visibleColumns.bib = true;
            //this._visibleColumns.nationality = true;
            //this._visibleColumns.diff = true;
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    }
}

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { maxVal, statusMap, timeToStatusMap } from '../../../fis/fis-constants';
import { ResultService } from '../../../services/result.service';
import { ResultItem } from '../../tab.component';

import { Filters } from './filter';
import { Sort } from './sort';

export interface Columns {
    bib: boolean;
    nationality: boolean;
    diff: boolean;
}

@Injectable()
export class DatagridState implements OnDestroy {
    private _change: BehaviorSubject<any> = new BehaviorSubject<any>({rows: [], isStartList: true});
    private _columns: BehaviorSubject<Columns>;
    private _visibleColumns: Columns = {
        bib: true,
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
        const history: number[] = [];
        let fastestTime: number = maxVal;
        let fastestDiff: number = maxVal;

        for (let i = 0; i < this._results.history.length; i++) {
            if (this._results.history[i].inter === this.inter) {
                history.push(this._results.history[i].racer);
                if (history.length === 3) {
                    break;
                }
            }
        }

        const count = this._results.rows.length;
        for (let i = 0; i < count; i++) {
            const row = this._results.rows[i];
            if (row.results[this.inter] !== undefined) {
                let diff;
                if (this.diff === 0) {
                    diff = row.results[this.inter].diffs[this.diff] + this._results.rows[0].results[0].time;
                } else {
                    diff = row.results[this.inter].diffs[this.diff];
                }
                fastestDiff = (diff < fastestDiff) ? diff : fastestDiff;
                fastestTime = (row.results[this.inter].time < fastestTime) ? row.results[this.inter].time : fastestTime;
                let state = 'normal';

                if (this.inter === 0) {
                    if (history.indexOf(row.racer.bib) === 0) {
                        state = 'update';
                    }
                } else {
                    if (history.indexOf(row.racer.bib) > -1) {
                        state = 'new';
                    }
                }

                const classes = [row.racer.nationality.toLowerCase(), state];
                if (row.results[this.inter].rank === 1 && this.inter > 0) {
                    classes.push('leader');
                } else if (row.results[this.inter].rank == null) {
                    classes.push('disabled');
                }

                if (row.racer.isFavorite) {
                    classes.push('favorite');
                }

                if (row.racer.color) {
                    classes.push(row.racer.color);
                }
                rows.push({
                    state: state,
                    racer: row.racer,
                    time: this.inter === 0 ? row.status : row.results[this.inter].time,
                    time_sort: this.inter === 0 ? row.status : row.results[this.inter].time,
                    rank: row.results[this.inter].rank,
                    diff: diff,
                    diff_sort: row.results[this.inter].diffs[this.diff],
                    name: row.racer.lastName + ', ' + row.racer.firstName,
                    notes: row.notes,
                    classes: classes
                });
            }
        }

        if (rows.length > 0) {
            this._rows = rows.map((row) => {
                if (this.inter !== 0) {
                    if (row.time > maxVal) {
                        row.time = timeToStatusMap[row.time];
                    } else if (row.rank > 1) {
                        row.time = row.notes.join(' ') + '+' + this.formatTime(row.time - fastestTime);
                    } else {
                        row.time = this.formatTime(row.time);
                    }
                } else {
                    row.time = statusMap[row.time] || row.time.toUpperCase();
                }

                if (this.diff !== null && row.diff < maxVal) {
                    if (this.diff === 0 && this.inter === 0) {
                        if (row.diff === fastestDiff) {
                            row.diff = this.formatTime(row.diff - fastestDiff);
                        } else {
                            row.diff = '+' + this.formatTime(row.diff - fastestDiff);
                        }
                    } else {
                        if (row.diff === fastestDiff) {
                            row.diff = this.formatTime(row.diff);
                        } else {
                            row.diff = '+' + this.formatTime(row.diff - fastestDiff);
                        }
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
                isStartList: (this.inter === 0)
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
            isStartList: (this.inter === 0)
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

    public ngOnDestroy() {
        this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    }
}

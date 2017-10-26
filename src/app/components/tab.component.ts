import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, getDropdownItems } from '../state/reducers';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Racer } from '../models/racer';
import { ResultService } from '../services/result.service';
import { DatagridState } from './datagrid/providers/datagrid-state';
import { RacerData } from '../state/reducers/result';
import { maxVal, timeToStatusMap } from '../fis/fis-constants';

export interface ResultItem {
    racer: Racer;
    time: number;
    status: string;
    diff: number;
    rank: number;
}

export interface TableConfiguration {
    isStartList: boolean;
    rows: any[];
    cols: string[];
}

@Component({
    selector: 'app-tab',
    template: `
        <app-grid-header [items]="intermediates$ | async" class="action-bar"></app-grid-header>
<div class="segment" appScrollbar>
    <app-table [breakpoint]="breakpoint" [config]="tableConfig$ | async"></app-table>
</div>`,
    providers: [DatagridState],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {

    public intermediates$: Observable<any[]>;
    public tableConfig$: Observable<TableConfiguration>;

    @Input() breakpoint = 'large';

    constructor(private _store: Store<AppState>, private _results: ResultService, private _state: DatagridState) {
        this.intermediates$ = _store.select(getDropdownItems);

        this.tableConfig$ = Observable.combineLatest(
            _results.results$,
            this._state.change)
            .map(([results, inter]) => this.parseResults(results, inter.inter, inter.diff, inter.visibleColumns));
    }


    public parseResults(results: RacerData[], inter: number, diff: number, cols): TableConfiguration {

        let rows = [];
        let fastestTime: number = maxVal;
        let fastestDiff: number = maxVal;

        for (let i = 0; i < results.length; i++) {
            const row = results[i];

            if (row.times[inter] !== undefined) {
                fastestDiff = (row.diffs[inter][diff] < fastestDiff) ? row.diffs[inter][diff] : fastestDiff;
                fastestTime = (row.times[inter].time < fastestTime) ? row.times[inter].time : fastestTime;
                rows.push({
                    state: '',
                    racer: row.racer,
                    time: inter === 0 ? row.status : row.times[inter].time,
                    time_sort: inter === 0 ? row.status : row.times[inter].time,
                    rank: row.times[inter].rank,
                    diff: row.diffs[inter][diff],
                    diff_sort: row.diffs[inter][diff],
                    name: row.racer.lastName + ', ' + row.racer.firstName
                });
            }
        }

        rows = rows.map((row) => {
            if (inter !== 0) {
                if (row.time > maxVal) {
                    row.time = timeToStatusMap[row.time];
                } else if (row.rank > 1) {
                    row.time = '+' + this.formatTime(row.time - fastestTime);
                } else {
                    row.time = this.formatTime(row.time);
                }
            }

            if (diff !== null && row.diff < maxVal) {
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

        return {
            rows: rows,
            isStartList: (inter === 0),
            cols: cols
        };
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
}

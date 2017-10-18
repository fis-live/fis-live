import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, getDropdownItems } from '../state/reducers';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Racer } from '../models/racer';
import { ResultService } from '../services/result.service';
import { DatagridState } from './datagrid/providers/datagrid-state';

export interface ResultItem {
    racer: Racer;
    time: number;
    status: string;
    diff: number;
    rank: number;
}

export interface TableConfiguration {
    isStartList: boolean;
    fastestTime: number;
    fastestDiff: number;
    rows: ResultItem[];
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
    private maxVal = 1000000000;

    constructor(private _store: Store<AppState>, private _results: ResultService, private _state: DatagridState) {
        this.intermediates$ = _store.select(getDropdownItems);

        this.tableConfig$ = Observable.combineLatest(
            _results.results$,
            this._state.change)
            .map(([results, inter]) => this.parseResults(results, inter.inter, inter.diff, inter.visibleColumns));
    }

    public parseResults(results, inter, diff, cols): TableConfiguration {
        const getValidDiff = (time, zero) => {
            if (time == null || zero == null) {
                return this.maxVal;
            } else if (time >= this.maxVal || zero >= this.maxVal) {
                return this.maxVal;
            }

            return time - zero;
        };

        if (inter === 0) {
            return {
                rows: results[0].entities.map((res, index) => ({
                    racer: res.racer,
                    rank: res.rank,
                    status: res.status,
                    diff: diff === 0 ? res.time - results[0].fastest : null,
                    state: '',
                    time: res.time
                })),
                isStartList: true,
                fastestTime: 0,
                fastestDiff: 0,
                cols: cols
            };
        }

        let count = results[0].entities.length;
        const fromStartList = [];
        for (let i = 0; i < count; i++) {
            const status = results[0].entities[i].status ? results[0].entities[i].status.toLowerCase() : null;
            let key = 0;
            switch (status) {
                case 'finish':
                    key = this.maxVal * 6;
                    break;
                case 'ral':
                    key = this.maxVal + 1;
                    break;
                case 'lapped':
                    key = this.maxVal * 2;
                    break;
                case 'dnf':
                    key = this.maxVal * 3;
                    break;
                case 'dq':
                    key = this.maxVal * 4;
                    break;
                case 'dns':
                    key = this.maxVal * 5;
                    break;
                default:
                    key = 0;
            }

            if (key > 0) {
                fromStartList[results[0].entities[i].racer.bib] = {
                    racer: results[0].entities[i].racer,
                    time: key,
                    status: status === 'finish' ? 'N/A' : results[0].entities[i].status,
                    rank: null,
                    diff: this.maxVal,
                    state: ''
                };
            }
        }

        if (results[inter] == null) {
            return {
                rows: fromStartList.filter(row => row != null),
                fastestTime: 0,
                fastestDiff: 0,
                isStartList: false,
                cols: cols
            };
        }

        count = results[inter].entities.length;
        const comp = [];
        if (diff !== null) {
            if (diff === 0) {
                results[diff].entities.forEach((item) => comp[item.racer.bib] = item.time - results[0].fastest);
            } else {
                results[diff].entities.forEach((item) => comp[item.racer.bib] = item.time);
            }
        }

        let rows = [];
        let fastestDiff = this.maxVal;
        results[inter].entities.forEach((row, index) => {
            if (fromStartList[row.racer.bib]) {
                fromStartList[row.racer.bib] = undefined;
            }
            const d = getValidDiff(row.time, comp[row.racer.bib]);
            fastestDiff = d < fastestDiff ? d : fastestDiff;
            rows.push({
                state: (count - index < 4) ? 'new' : '',
                racer: row.racer,
                time: row.time,
                status: row.status,
                rank: row.rank,
                diff: d
            });
        });

        rows = rows.concat(fromStartList.filter(row => row != null));

        return {
            rows: rows,
            fastestTime: results[inter].fastest,
            fastestDiff: fastestDiff,
            isStartList: false,
            cols: cols
        };
    }
}

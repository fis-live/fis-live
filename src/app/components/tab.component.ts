import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, getDropdownItems } from '../state/reducers';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { Racer } from '../models/racer';
import { DropdownItem } from './dropdown.component';
import { ToggleFavoriteAction } from '../state/actions/settings';
import { ResultService } from '../services/result.service';

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
}

@Component({
    selector: 'app-tab',
    template: `
<div class="ui top attached buttons">
    <app-dropdown [items]="intermediates$ | async"
        [placeholder]="'Select intermediate...'"
        [cssClass]="'button primary'"
        (selectedChanged)="setInter($event)"></app-dropdown>
        
     <app-dropdown [items]="diffs$ | async"
        [placeholder]="'Compare...'"
        [cssClass]="'button positive'"
        (selectedChanged)="setDiff($event)"></app-dropdown>
</div>
<div class="ui attached segment" appScrollbar>
    <app-table (toggleFavorite)="toggleFavorite($event)"
        [breakpoint]="breakpoint"
        [config]="tableConfig$ | async"></app-table>
</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {

    public intermediates$: Observable<DropdownItem[]>;
    public diffs$: Observable<DropdownItem[]>;
    public tableConfig$: Observable<TableConfiguration>;

    public filter$: Subject<number> = new BehaviorSubject<number>(null);
    public diff$: Subject<number> = new BehaviorSubject<number>(null);
    @Input() breakpoint = 'large';
    private maxVal = 1000000000;

    constructor(private _store: Store<AppState>, private _results: ResultService) {
        this.intermediates$ = _store.select(getDropdownItems);

        this.diffs$ = Observable.combineLatest(_store.select(getDropdownItems), this.filter$.distinctUntilChanged())
            .map(([items, inter]) => {
                return items.reduce((arr, item) => {
                    return (item.data_value > 0 && item.data_value < inter) ? arr.concat(item) : arr;
                }, [{data_value: 0, selected_text: 'From start', default_text: 'From start'}]);
            });

        this.tableConfig$ = Observable.combineLatest(
            _results.results$,
            this.filter$.distinctUntilChanged(),
            this.diff$.distinctUntilChanged())
            .map(([results, inter, diff]) => this.parseResults(results, inter, diff));
    }

    public setInter($event: DropdownItem) {
        this.filter$.next($event !== null ? +$event.data_value : null);
    }

    public parseResults(results, inter, diff): TableConfiguration {
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
                fastestDiff: 0
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
                isStartList: false
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
            isStartList: false
        };
    }

    public setDiff($event: DropdownItem) {
        this.diff$.next($event !== null ? +$event.data_value : null);
    }

    public toggleFavorite(racer: Racer): void {
        this._store.dispatch(new ToggleFavoriteAction(racer));
    }
}

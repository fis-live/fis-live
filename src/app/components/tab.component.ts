import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, getDropdownItems } from '../state/reducers';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Racer } from '../models/racer';
import { DropdownItem } from './dropdown.component';
import { ResultService } from '../services/result.service';
import { RacerData } from '../state/reducers/result';
import { maxVal } from '../fis/fis-constants';

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
<div class="action-bar">
    <app-dropdown [items]="intermediates$ | async"
        [placeholder]="'Select intermediate...'"
        [cssClass]="'button primary'"
        (selectedChanged)="setInter($event)"></app-dropdown>

     <app-dropdown [items]="diffs$ | async"
        [placeholder]="'Compare...'"
        [cssClass]="'button positive'"
        (selectedChanged)="setDiff($event)"></app-dropdown>
</div>
<div class="segment" appScrollbar>
    <app-table [breakpoint]="breakpoint" [config]="tableConfig$ | async"></app-table>
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

    public parseResults(results: RacerData[], inter: number, diff: number): TableConfiguration {

        const rows = [];
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
                        time: row.times[inter].time,
                        status: row.status,
                        rank: row.times[inter].rank,
                        diff: row.diffs[inter][diff]
                    });
                }
            }

        return {
            rows: rows,
            fastestTime: fastestTime,
            fastestDiff: fastestDiff,
            isStartList: (inter === 0)
        };
    }

    public setDiff($event: DropdownItem) {
        this.diff$.next($event !== null ? +$event.data_value : null);
    }
}

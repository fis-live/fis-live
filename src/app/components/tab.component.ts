import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, getDropdownItems } from '../state/reducers';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Racer } from '../models/racer';
import { DropdownItem } from './dropdown.component';
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
        console.log(results);

            return {
                rows: [],
                isStartList: true,
                fastestTime: 0,
                fastestDiff: 0
            };
    }

    public setDiff($event: DropdownItem) {
        this.diff$.next($event !== null ? +$event.data_value : null);
    }
}

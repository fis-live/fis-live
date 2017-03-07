import {
    Component, Input, ChangeDetectionStrategy, EventEmitter, Output,
    OnDestroy, AfterViewInit
} from '@angular/core';
import { style, animate, trigger, transition, state } from '@angular/animations';

import { ResultItem, TableConfiguration } from '../tab.component';
import { Racer } from '../../models/racer';
import { Sort } from './providers/sort';
import { Subscription } from 'rxjs/Subscription';
import { Filters } from './providers/filter';

import { nationalities, maxVal, statusMap } from '../../fis/fis-constants';

@Component({
    selector: 'app-table',
    templateUrl: 'result.component.html',
    providers: [ Sort, Filters ],
    animations: [
        trigger('color', [
            state('new', style({
                backgroundColor: '#FFE5BC'
            })),
            transition('void => new', [
                animate('600ms ease')
            ]),
            transition('new => *', [
                animate('600ms ease')
            ])
        ]),
        trigger('newRow', [
            transition('void => *', [
                style({maxHeight: '0px', padding: '0 .7em', overflow: 'hidden'}),
                animate('600ms ease', style({
                    maxHeight: '100px',
                    padding: '0.3em .7em'
                }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultComponent implements AfterViewInit, OnDestroy {
    public rows: ResultItem[];
    private _config: TableConfiguration;
    private _subscriptions: Subscription[] = [];

    @Input() public breakpoint = 'large';
    @Output() public toggleFavorite = new EventEmitter<Racer>();

    public FLAGS = nationalities;
    public maxVal = maxVal;
    public statusMap = statusMap;

    constructor(private sort: Sort, private filters: Filters) {
        this.sort.toggle('rank');
    }

    @Input() public set config(config: TableConfiguration) {
        if ((this.sort.comparator === 'time' || this.sort.comparator === 'status') &&
            config.isStartList !== this._config.isStartList) {
            this.sort.comparator = config.isStartList ? 'status' : 'time';
        }

        this._config = config;
        this.triggerRefresh();
    }

    public get config() {
        return this._config;
    }

    private triggerRefresh() {
        let rows = this.config.rows;

        if (this.filters.hasActiveFilters()) {
            rows = rows.filter((row) => this.filters.accepts(row));
        }

        if (rows != null && this.sort.comparator) {
            rows.sort((a, b) => this.sort.compare(a, b));
        }

        this.rows = rows;
    }

    public track(index: number, item: any): number {
        return item.racer.bib;
    }

    public getDiff(diff) {
        if (diff === this.config.fastestDiff) {
            return this.transform(diff);
        }

        return '+' + this.transform(diff - this.config.fastestDiff);
    }

    public getStatus(row: ResultItem) {
        if (this.config.isStartList || row.time > this.maxVal) {
            return (row.status !== null) ? this.statusMap[row.status] || row.status.toUpperCase() : '';
        } else if (row.rank > 1) {
            return '+' + this.transform(row.time - this.config.fastestTime);
        }

        return this.transform(row.time);
    }

    public transform(time: number): string {
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

    public getData(row: ResultItem, propertyName: string): any {
        return propertyName.split('.').reduce((prev: any, curr: string) => prev[curr], row);
    }

    ngAfterViewInit() {
        this._subscriptions.push(this.sort.change.subscribe(() => this.triggerRefresh()));
        this._subscriptions.push(this.filters.change.subscribe(() => this.triggerRefresh()));
    }

    ngOnDestroy() {
        this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    }
}

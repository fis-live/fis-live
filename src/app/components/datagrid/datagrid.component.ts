import {
    Component, Input, ChangeDetectionStrategy, OnDestroy, AfterViewInit
} from '@angular/core';
import { style, animate, trigger, transition, state } from '@angular/animations';

import { ResultItem, TableConfiguration } from '../tab.component';
import { Sort } from './providers/sort';
import { Subscription } from 'rxjs/Subscription';
import { Filters } from './providers/filter';

@Component({
    selector: 'app-table',
    templateUrl: 'datagrid.component.html',
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
export class DatagridComponent implements AfterViewInit, OnDestroy {
    public rows: ResultItem[];
    private _config: TableConfiguration;
    private _subscriptions: Subscription[] = [];

    @Input() public breakpoint = 'large';

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
        if (this._config == null) {
            return {
                isStartList: true,
                rows: [],
                cols: ['bib']
            };
        }
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

    public ngAfterViewInit() {
        this._subscriptions.push(this.sort.change.subscribe(() => this.triggerRefresh()));
        this._subscriptions.push(this.filters.change.subscribe(() => this.triggerRefresh()));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    }
}

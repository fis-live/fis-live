import {
    Component, Input, trigger, state, style, transition, animate, ChangeDetectionStrategy
} from '@angular/core';

import { ResultItem } from "../race-tab.component";
import { Dimensions } from "../DimensionsDirective";

@Component({
    selector: 'app-table',
    template: `
    <table class="ui unstackable striped compact table" role="grid" dimensions (onDimensionsChange)="onChange($event)">
        <thead>
            <tr role="row">
                <th [ngClass]="getSortingClass('order')" (click)="setSorting('order')">{{ isStartList ? 'Order' : 'Rank' }}</th>
                <th [class.hide]="responsive" [ngClass]="getSortingClass('racer.bib')" (click)="setSorting('racer.bib')">Bib</th>
                <th [ngClass]="getSortingClass('racer.lastName')" (click)="setSorting('racer.lastName')">Name</th>
                <th [ngClass]="getSortingClass('time')" (click)="setSorting('time')">{{ isStartList ? 'Status' : 'Time' }}</th>
                <th [class.hide]="responsive" [ngClass]="getSortingClass('racer.nationality')" (click)="setSorting('racer.nationality')">Nationality</th>
                <th [ngClass]="getSortingClass('diff')" (click)="setSorting('diff')">Diff.</th>
            </tr>
        </thead>
        <tbody>
            <tr [ngClass]="{'favorite': row.racer.isFavorite}" *ngFor="let row of rows; trackBy: track" [@color]="row.state" role="row">
                <td><div [@newRow]="row.state">{{ isStartList ? row.order : row.rank }}</div></td>
                <td [ngClass]="{hide: responsive}"><div [@newRow]="row.state" [ngClass]="getBibClass(row.color)">{{ row.racer.bib }}</div></td>
                <td [ngClass]="{hide: responsive}"><div [@newRow]="row.state">{{ row.racer.firstName }} {{ row.racer.lastName }}</div></td>
                <td [ngClass]="{hide: !responsive}"><div [@newRow]="row.state"><i class="{{ row.racer.nationality | lowercase }} flag"></i><b>{{ row.racer.lastName }}</b>, {{ row.racer.firstName }} </div></td>
                <td><div [@newRow]="row.state"><span [style.font-weight]="row.rank == 1 ? 700: 'normal'">{{ getStatus(row) }}</span></div></td>
                <td [ngClass]="{hide: responsive}"><div [@newRow]="row.state"><i class="{{ row.racer.nationality | lowercase }} flag"></i>{{ row.racer.nationality }}</div></td>
                <td><div [@newRow]="row.state">{{ (row.time < maxVal && row.diff < maxVal) ? transform(row.diff) : '' }}</div></td>
            </tr>
        </tbody>
    </table>
`,
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
            transition('void => new', [
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
export class TableComponent {
    // Table values
    //@Input()
    public _rows: Array<ResultItem> = [];
    @Input() public isStartList: boolean = true;

    public state = 'active';

    private sortBy: string = 'order';
    private sortOrder: string = 'asc';
    private maxVal = 1000000000;

    private statusMap = {
        'start': 'Started',
        'finish': 'Finished',
        'lapped': 'Lapped',
        'nextstart': 'Next to start'
    };

    public responsive: boolean = false;

    public track(index: number, item: ResultItem): number {
        return item.racer.bib;
    }

    public onChange($event: Dimensions) {
        if ($event.width < 767 && !this.responsive) {
            this.responsive = true;
        } else if ($event.width >= 767 && this.responsive) {
            this.responsive = false;
        }
    }

    public getBibClass(color: string) {
        if (color) {
            return 'ui label ' + color;
        }

        return '';
    }

    public sort(a: ResultItem, b: ResultItem): number {

        if (this.getData(a, this.sortBy) > this.getData(b, this.sortBy)) {
            return (this.sortOrder === 'asc') ? 1 : -1;
        } else if (this.getData(a, this.sortBy) < this.getData(b, this.sortBy)) {
            return (this.sortOrder === 'asc') ? -1 : 1;
        }

        return 0;
    }

    @Input() public set rows(rows: Array<ResultItem>) {
        if (!this.isStartList && (this.sortBy === 'order' || this.sortBy === 'status')) {
            this.sortBy = 'time';
            this.sortOrder = 'asc';
        } else if (this.isStartList && this.sortBy === 'time') {
            this.sortBy = 'order';
            this.sortOrder = 'asc';
        }

        if (rows !== null) {
            rows.sort((a, b) => this.sort(a, b));
        }

        this._rows = rows;
    }

    public get rows() {
        return this._rows;
    }

    private transform(time: number): string {
        if (time === null) {
            return '';
        }
        let timeStr = '',
            hours = Math.floor(time / (1000 * 60 * 60));

        let minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
        let seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
        let tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);
        let hundreds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000 - tenths * 100) / 10);

        if (hours > 0 || minutes > 0) {
            if (hours > 0){
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

    public getStatus(row: ResultItem) {
        if (this.isStartList || row.time > this.maxVal) {
            return (row.status !== null) ? this.statusMap[row.status] || row.status.toUpperCase() : '';
        } else if (row.rank > 1) {
            return '+' + this.transform(row.time - row.fastest);
        }

        return this.transform(row.time);
    }

    public getSortingClass(column: string) {
        let sortable = (column === 'order' && !this.isStartList) ? false : true;
        if (column === 'time' && this.isStartList) {
            column = 'status';
        }

        return {
            'sorting': sortable && this.sortBy !== column,
            'sorting_desc': this.sortBy === column && this.sortOrder === 'desc',
            'sorting_asc': this.sortBy === column && this.sortOrder === 'asc'
        };
    }

    public setSorting(column: string): void {
        if (column === 'order' && !this.isStartList) {
            return;
        }

        if (column === 'time' && this.isStartList) {
            column = 'status';
        }

        if (this.sortBy === column) {
            switch (this.sortOrder) {
                case '':
                    this.sortOrder = 'asc';
                    break;
                case 'asc':
                    this.sortOrder = 'desc';
                    break;
                case 'desc':
                    this.sortOrder = 'asc';
                    break;
                default:
                    this.sortOrder = '';
            }
        } else {
            this.sortOrder = 'asc';
        }

        this.sortBy = column;

        this._rows.sort((a, b) => this.sort(a, b));
    }

    public getData(row: ResultItem, propertyName: string): string {
        return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
    }
}
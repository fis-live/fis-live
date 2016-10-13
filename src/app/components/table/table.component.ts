import {
    Component, EventEmitter, Input, Output, trigger, state, style, transition, animate,
    AfterViewChecked, OnChanges, SimpleChanges, SimpleChange
} from '@angular/core';
import {ResultItem} from "../../race-tab.component";

export interface TableConfig {
    isStartList: boolean;
}

@Component({
    selector: 'app-table',
    template: `
    <table class="ui unstackable striped compact table" role="grid">
        <thead>
            <tr role="row">
                <th>{{ config.isStartList ? 'Order' : 'Rank' }}</th>
                <th [ngClass]="getSortingClass('racer.bib')" (click)="setSorting('racer.bib')">Bib</th>
                <th [ngClass]="getSortingClass('racer.lastName')" (click)="setSorting('racer.lastName')">Name</th>
                <th [ngClass]="getSortingClass('time')" (click)="setSorting('time')">{{ config.isStartList ? 'Status' : 'Time' }}</th>
                <th [ngClass]="getSortingClass('racer.nationality')" (click)="setSorting('racer.nationality')">Nationality</th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let row of rows; trackBy: track" [@color]="row.state" role="row">
                <td><div [@newRow]>{{ config.isStartList ? row.order : row.rank }}</div></td>
                <td><div [@newRow]>{{ row.racer.bib }}</div></td>
                <td><div [@newRow]>{{ row.racer.firstName }} {{ row.racer.lastName }}</div></td>
                <td><div [@newRow]>{{ getStatus(row) }}</div></td>
                <td><div [@newRow]>{{ row.racer.nationality }}</div></td>
            </tr>
        </tbody>
    </table>
`,
    animations: [
        trigger('color', [
            state('new', style({
                backgroundColor: '#66afe9'
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
                style({maxHeight: '0px', padding: '0 .7em'}),
                animate('600ms ease', style({
                    maxHeight: '100px',
                    padding: '0.3em .7em'
                }))
            ])
        ])
    ]
})
export class TableComponent {
    // Table values
    //@Input()
    public _rows: Array<ResultItem> = [];
    @Input() public config: TableConfig = {isStartList: true};

    public state = 'active';

    private sortBy: string = 'time';
    private sortOrder: string = 'asc';
    private maxVal = 1000000000;

    public track(index: number, item: ResultItem): number {
        return item.racer.bib;
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

        if (rows !== null) {
            rows.sort((a, b) => this.sort(a, b));
        }

        this._rows = rows;
    }

    public get rows() {
        return this._rows;
    }

    private transform(time: number): string {
        let timeStr = '',
            hours = Math.floor(time / (1000 * 60 * 60));

        let minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
        let seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
        let tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);

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

        return timeStr;
    }

    public getStatus(row: ResultItem) {
        if (this.config.isStartList || row.time > this.maxVal) {
            return row.status.toUpperCase();
        } else if (row.rank > 1) {
            return '+' + this.transform(row.time - row.fastest);
        }

        return this.transform(row.time);
    }

    public getSortingClass(column: string) {
        let sortable = (column === 'rank' && !this.config.isStartList) ? false : true;
        return {
            'sorting': sortable && this.sortBy !== column,
            'sorting_desc': this.sortBy === column && this.sortOrder === 'desc',
            'sorting_asc': this.sortBy === column && this.sortOrder === 'asc'
        };
    }

    public setSorting(column: string): void {
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
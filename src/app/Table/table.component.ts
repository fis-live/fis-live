import {Component, EventEmitter, Input, Output, trigger, state, style, transition, animate} from '@angular/core';

export interface TableConfig {
    columns: Column[];
    sortable: boolean;
}

export interface Column {
    name: string;
    title: string;
    sortable: boolean;
    sort: string;
}

@Component({
    selector: 'app-table',
    template: `
    <table class="ui unstackable striped compact table" role="grid">
      <thead>
      <tr role="row">
        <th *ngFor="let column of config.columns"
        [ngClass]="{'sorting': column.sortable && column.sort === '', 'sorting_desc': column.sort === 'desc', 'sorting_asc': column.sort === 'asc'}"
        (click)="onChangeTable(column)">
          {{ column.title }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let row of rows" role="row">
        <td *ngFor="let column of config.columns">{{ getData(row, column.name) }}</td>
      </tr>
      </tbody>
    </table>
`,
    animations: [
        trigger('newRow', [
            transition('void => new', [
                style({maxHeight: '0px', padding: '0 .71428571em'}),
                animate('600ms ease', style({maxHeight: '100px', padding: '.71428571em'}))
            ])
        ])
    ]
})
export class TableComponent<T> {
    // Table values
    @Input() public rows: Array<T> = [];
    @Input() public config: TableConfig = {columns: [], sortable: false};

    // Outputs (Events)
    @Output()
    public tableChanged: EventEmitter<Column> = new EventEmitter<Column>();

    public onChangeTable(column: Column): void {
        switch (column.sort) {
            case '':
                column.sort = 'asc';
                break;
            case 'asc':
                column.sort = 'desc';
                break;
            default:
                column.sort = '';
        }
        this.tableChanged.emit(column);
    }

    public getData(row: any, propertyName: string): string {
        return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
    }
}
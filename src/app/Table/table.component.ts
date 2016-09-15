import {Component, EventEmitter, Input, Output, trigger, state, style, transition, animate} from '@angular/core';

export interface TableConfig {
    columns: Array<Column>;
    sortable: boolean;
}

export interface Column {
    name: string;
    title: string;
    sortable: boolean;
    sort: string;
}

export interface Sort {
    sortBy: string;
    sortOrder: string;
}

@Component({
    selector: 'app-table',
    template: `
    <table class="ui unstackable striped compact table" role="grid">
      <thead>
      <tr role="row">
        <th *ngFor="let column of config.columns"
        [ngClass]="{'sorting': column.sortable && sorting.sortBy !== column.name,
        'sorting_desc': sorting.sortBy === column.name && sorting.sortOrder === 'desc',
        'sorting_asc': sorting.sortBy === column.name && sorting.sortOrder === 'asc'}"
        (click)="setSorting(column)">
          {{ column.title }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let row of rows" role="row">
        <td *ngFor="let column of config.columns"><div>{{ getData(row, column.name) }}</div></td>
      </tr>
      </tbody>
    </table>
`,
    animations: [
        trigger('newRow', [
            transition('void => *', [
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

    private sorting: Sort = {sortBy: '', sortOrder: ''};

    // Outputs (Events)
    @Output()
    public sortChanged: EventEmitter<Sort> = new EventEmitter<Sort>();

    public setSorting(column: Column): void {
        if (this.sorting.sortBy === column.name) {
            switch (this.sorting.sortOrder) {
                case '':
                    this.sorting.sortOrder = 'asc';
                    break;
                case 'asc':
                    this.sorting.sortOrder = 'desc';
                    break;
                case 'desc':
                    this.sorting.sortOrder = 'asc';
                    break;
                default:
                    this.sorting.sortOrder = '';
            }
        } else {
            this.sorting.sortOrder = 'asc';
        }

        this.sorting.sortBy = column.name;

        this.sortChanged.emit(this.sorting);
    }

    public getData(row: any, propertyName: string): string {
        return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
    }
}
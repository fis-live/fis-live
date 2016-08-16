import {Component, EventEmitter, Input, Output, trigger, state, style, transition, animate} from '@angular/core';

@Component({
    selector: 'app-table',
    template: `
    <table class="ui unstackable striped compact table" role="grid">
      <thead>
      <tr role="row">
        <th *ngFor="let column of columns">
          {{column.title}}
          <i *ngIf="config && column.sort" class="pull-right fa"
            [ngClass]="{'fa-chevron-down': column.sort === 'desc', 'fa-chevron-up': column.sort === 'asc'}"></i>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let row of rows">
        <td *ngFor="let column of columns">{{getData(row, column.name)}}</td>
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
    @Input() public rows:Array<T> = [];
    @Input() public config:any = {};

    // Outputs (Events)
    @Output()
    public tableChanged:EventEmitter<any> = new EventEmitter();

    @Input()
    public set columns(values:Array<any>) {
        values.forEach((value:any) => {
            let column = this._columns.find((col:any) => col.name === value.name);
            if (column) {
                Object.assign(column, value);
            }
            if (!column) {
                this._columns.push(value);
            }
        });
    }

    public get columns():Array<any> {
        return this._columns;
    }

    public get configColumns():any {
        let sortColumns:Array<any> = [];

        this.columns.forEach((column:any) => {
            if (column.sort) {
                sortColumns.push(column);
            }
        });

        return {columns: sortColumns};
    }

    private _columns:Array<any> = [];

    public onChangeTable(column:any):void {
        this._columns.forEach((col:any) => {
            if (col.name !== column.name && col.sort !== false) {
                col.sort = '';
            }
        });
        this.tableChanged.emit({sorting: this.configColumns});
    }

    public getData(row:any, propertyName:string):string {
        return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
    }
}
import { animate, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { CdkTableModule } from '@angular/cdk/table';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LetDirective, PushPipe } from '@ngrx/component';
import { Observable } from 'rxjs';

import { IconComponent } from '../core/icon/icon.component';
import { FormatNamePipe } from '../fis/format-name.pipe';

import { DatagridSort } from './sort/datagrid-sort';
import { DatagridStore } from './state/datagrid-store';
import { ColumnDef, DatagridState, ResultItem } from './state/model';
import { TableDataSource } from './state/table-data-source';

@Component({
    selector: 'app-datagrid',
    templateUrl: 'datagrid.html',
    animations: [
        trigger('newRow', [
            transition('void => new', group([
                style({ transform: 'translateX(30px)', opacity: 0 }),
                query('td > div', [
                    style({ backgroundColor: '{{ color }}', height: '0px' }),
                    group([
                        animate('300ms ease', style({ height: '*' })),
                        animate('600ms 5000ms ease', style({ backgroundColor: '*' }))
                    ])
                ]),
                animate('600ms 300ms ease', style({
                    opacity: 1,
                    transform: 'translateX(0)'
                }))
            ]))
        ]),
        trigger('update', [
            transition(':increment', [
                query('td > div', [
                    animate('1000ms ease', keyframes([
                        style({ backgroundColor: '#9BD8F3' }),
                        style({ backgroundColor: '*' })
                    ]))
                ])
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CdkTableModule,
        PushPipe,
        LetDirective,
        NgForOf,
        DatagridSort,
        FormatNamePipe,
        IconComponent,
        NgIf,
        NgClass
    ]
})
export class Datagrid {
    @Input() public config!: DatagridState;
    public readonly rows$: Observable<ResultItem[]>;

    constructor(public store: DatagridStore, dataSource: TableDataSource) {
        this.rows$ = dataSource.connect();
    }

    public track(index: number, item: ResultItem): number {
        return item.racer.bib;
    }

    public trackColumn(index: number, column: ColumnDef) {
        return column.id;
    }
}

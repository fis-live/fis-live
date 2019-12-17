import { animate, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ResultItem } from '../models/table';

import { Config } from './providers/config';
import { DatagridState } from './providers/datagrid-state';

@Component({
    selector: 'app-table',
    templateUrl: 'datagrid.component.html',
    animations: [
        trigger('newRow', [
            transition('void => new', group([
                query('td > div', [
                    style({backgroundColor: '#F7D57F', maxHeight: '0px'}),
                    group([
                        animate('300ms ease',
                            style({
                                maxHeight: '24px',
                            })),
                        animate('600ms 5000ms ease', style({
                            backgroundColor: '*',
                        }))
                    ])
                ]),
                style({transform: 'translateX(30px)', opacity: 0}),
                group([
                    animate('600ms 300ms ease',
                        style({
                            opacity: 1,
                            transform: 'translateX(0)',
                        }))
                ])
            ])),

            transition('normal => update', [
                style({backgroundColor: '*'}),
                animate('1000ms ease', keyframes([
                    style({
                        backgroundColor: '#D8E1FF',
                    }),
                    style({
                        backgroundColor: '*',
                    })
                ]))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridComponent {
    @Input() public config!: Config;
    public readonly rows$: Observable<ResultItem[]>;

    constructor(dataSource: DatagridState) {
        this.rows$ = dataSource.connect();
    }

    public track(index: number, item: ResultItem): number {
        return item.racer.bib;
    }
}

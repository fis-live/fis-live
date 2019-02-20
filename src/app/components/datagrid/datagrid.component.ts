import { animate, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResultItem } from '../../models/table';
import { AppState, selectAllIntermediates } from '../../state/reducers';

import { Config } from './providers/config';
import { DatagridState } from './providers/datagrid-state';

export interface ColumnDef {
    id: string;
    name: string;
    sortBy: string;
    key: number;
}

@Component({
    selector: 'app-table',
    templateUrl: 'datagrid.component.html',
    animations: [
        trigger('newRow', [
            transition('void => new', [
                query('td > div', [
                    style({backgroundColor: '#FFF', maxHeight: '0px'}),
                    group([
                        animate('800ms ease',
                            style({
                                backgroundColor: '#F7D57F',
                                maxHeight: '24px',
                            })),
                        animate('600ms 5000ms ease', style({
                            backgroundColor: '*',
                        }))
                    ])
                ])
            ]),

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
    @Input() public config: Config;

    public intermediates$: Observable<ColumnDef[]>;

    constructor(public state: DatagridState, store: Store<AppState>) {
        this.intermediates$ = store.pipe(
            select(selectAllIntermediates),
            map(values => values.map(inter => {
                return {
                    id: 'inter' + inter.key,
                    sortBy: 'marks.' + inter.key + '.value',
                    name: inter.distance + ' KM',
                    key: inter.key
                };
            })));
    }

    public track(index: number, item: ResultItem): number {
        return item.bib;
    }
}

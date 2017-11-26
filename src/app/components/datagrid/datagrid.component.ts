import { animate, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ResultItem, TableConfiguration } from '../tab.component';

import { Columns } from './providers/datagrid-state';

@Component({
    selector: 'app-table',
    templateUrl: 'datagrid.component.html',
    animations: [
        trigger('newRow', [
            transition('void => new', [
                query('td > div', [
                    style({backgroundColor: '#FFF', maxHeight: '0px', padding: '0 8px', overflow: 'hidden'}),
                    group([
                        animate('800ms ease',
                            style({
                                backgroundColor: '#F7D57F',
                                maxHeight: '24px',
                                padding: '4px 8px'
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
    public rows: ResultItem[];
    private _config: TableConfiguration;
    @Input() public breakpoint: string;

    @Input() public columns: Columns;

    @Input()
    public set config(config: TableConfiguration) {
        this._config = config;
        this.rows = config.rows;
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

    public track(index: number, item: any): number {
        return item.racer.bib;
    }
}

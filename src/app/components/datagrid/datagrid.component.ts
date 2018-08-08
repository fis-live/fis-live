import { animate, group, keyframes, query, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Columns, ResultItem, TableConfiguration } from '../../models/table';

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
    private _config: TableConfiguration;
    @Input() public breakpoint: string;

    @Input() public columns: Columns;

    @Input()
    public set config(config: TableConfiguration) {
        console.log(config);
        this._config = config;
    }

    public get config() {
        if (this._config == null) {
            return {
                isStartList: true,
                rows: [],
                fastest: {time: 0, diff: 0}
            };
        }
        return this._config;
    }

    public track(index: number, item: ResultItem): number {
        return item.bib;
    }
}

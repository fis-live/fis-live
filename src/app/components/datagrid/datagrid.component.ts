import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ResultItem, TableConfiguration } from '../tab.component';

@Component({
    selector: 'app-table',
    templateUrl: 'datagrid.component.html',
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
            transition('void => *', [
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
export class DatagridComponent {
    public rows: ResultItem[];
    private _config: TableConfiguration;

    @Input() public breakpoint = 'large';

    @Input() public set config(config: TableConfiguration) {
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

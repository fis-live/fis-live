import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Filter } from './filter';

@Component({
    selector: 'app-dg-filter',
    templateUrl: './datagrid-filter.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            transition(':enter', [
                style({width: 0}),
                animate('200ms ease', style({width: '*'}))
            ])
        ])
    ]
})
export class DatagridFilter<T> {
    public open: boolean = false;
    public input: string | null = null;

    constructor(public filter: Filter<T>) { }

    public toggle() {
        this.open = !this.open;
    }

    public enter(): void {
        if (this.input !== null && this.input.length > 0) {
            this.filter.addTerm(this.input);
        }

        this.input = null;
        this.toggle();
    }

    public reset(): void {
        if (this.input !== null && this.input.length > 0) {
            this.filter.removeTerm(this.input);
        }

        this.toggle();
    }
}

import { Directive, HostBinding, HostListener, Input } from '@angular/core';

import { Sort } from './sort';

@Directive({
    selector : '[appDgSort]',
    standalone: true
})
export class DatagridSort {
    @Input('appDgSort')
    public sortBy: string = '';

    @HostBinding('class.sorting') sorting = true;

    @HostBinding('class.asc')
    public get asc() {
        return this._sort.comparator === this.sortBy && !this._sort.reverse;
    }

    @HostBinding('class.desc')
    public get desc() {
        return this._sort.comparator === this.sortBy && this._sort.reverse;
    }

    constructor(private _sort: Sort) { }

    @HostListener('click', ['$event.shiftKey'])
    public toggleSort(shiftClick: boolean) {
        if (shiftClick) {
            return;
        }
        this._sort.toggle(this.sortBy);
    }
}

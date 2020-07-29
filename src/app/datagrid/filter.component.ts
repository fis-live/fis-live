import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ElementRef, OnDestroy, Renderer2
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { AbstractPopover } from '../utils/abstract-popover';

import { Filter } from './interfaces/filter';
import { Filters } from './providers/filter';

@Component({
    selector: 'app-filter',
    template: `
<!--div *ngIf="isActive()" class="ui label" style="padding: 0.2em 0.4em;position: absolute;top: 0.5em;right: 1.9em;">
    {{ input }}
<i (click)="reset()" class="icon delete"></i>
</div-->
<button
        (click)="toggle()"
        class="datagrid-filter-toggle"
        [class.datagrid-filter-open]="open"
        [class.datagrid-filtered]="isActive()"
        type="button">
    <clr-icon [shape]="isActive() ? 'filter-grid-circle': 'filter-grid'" class="is-solid"></clr-icon>
</button>

<div class="datagrid-filter" *ngIf="open">
    <div class="datagrid-filter-close-wrapper">
        <button type="button" class="close" aria-label="Close" (click)="toggle()">
            <clr-icon shape="times"></clr-icon>
        </button>
    </div>

    <div class="search-input">
        <input appFocusOnInit
            placeholder="Search..." type="text" class="clr-input"
            [(ngModel)]="input"
            (keyup)="filterChanged()"
            (keyup.enter)="toggle()"
            (keyup.escape)="reset()">
    </div>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent extends AbstractPopover implements Filter, AfterViewInit, OnDestroy {
    private _changes = new Subject<void>();
    private _unRegister: () => void = () => {};

    public get changes(): Observable<void> {
        return this._changes.asObservable();
    }

    public input: string | null = null;

    constructor(private filters: Filters, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    ngAfterViewInit() {
        this._unRegister = this.filters.add(this);
    }

    public accepts(item: any): boolean {
        return this.input === null || item.racer.value.indexOf(this.input.toLowerCase()) >= 0;
    }

    isActive(): boolean {
        return this.input !== null && this.input.length > 0;
    }

    public filterChanged() {
        this._changes.next();
    }

    public reset(): void {
        this.input = null;
        this.filterChanged();
        this.toggle();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this._unRegister();
    }
}
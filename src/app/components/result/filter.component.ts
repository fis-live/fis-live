import {
    Component, ChangeDetectionStrategy, ElementRef, HostListener, Output, EventEmitter, Input, AfterContentInit,
    OnDestroy, AfterViewInit
} from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { Filter } from './interfaces/filter';
import { Filters } from './providers/filter';

@Component({
    selector: 'app-filter',
    template: `
<!--div *ngIf="isActive()" class="ui label" style="padding: 0.2em 0.4em;position: absolute;top: 0.5em;right: 1.9em;">
    {{ input }}
<i (click)="reset()" class="icon delete"></i>
</div-->
<i class="icon app-filter" [ngClass]="{'filter-open': isOpen, 'filtered': isActive()}" (click)="open()"></i>

<div class="datagrid-filter" *ngIf="isOpen">
    <div class="datagrid-filter-close-wrapper">
        <button type="button" class="close" aria-label="Close" (click)="close()">
            <clr-icon shape="times"></clr-icon>
        </button>
    </div>
    
    <div class="ui icon input">
        <input focusOnInit
            placeholder="Search..." type="text"
            [(ngModel)]="input"
            (keyup)="filterChanged()"
            (keyup.enter)="close()"
            (keyup.escape)="reset()">
        <i class="search icon"></i>
    </div>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements Filter, AfterViewInit, OnDestroy {
    private _changes: Subject<any> = new Subject<any>();
    private _unRegister: () => void;

    public get changes(): Observable<any> {
        return this._changes.asObservable();
    }

    public isOpen = false;
    public input: string;

    constructor(private filters: Filters, private elementRef: ElementRef) { }

    ngAfterViewInit() {
        this._unRegister = this.filters.add(this);
    }

    public accepts(item: any): boolean {
        return item.racer.lastName.toLowerCase().indexOf(this.input.toLowerCase()) >= 0;
    }

    isActive(): boolean {
        return this.input && this.input.length > 0;
    }

    public filterChanged() {
        this._changes.next();
    }

    public close(): void {
        this.isOpen = false;
    }

    public open(): void {
        this.isOpen = true;
    }

    public reset(): void {
        this.input = null;
        this.filterChanged();
        this.isOpen = false;
    }

    ngOnDestroy(): void {
        if (this._unRegister) {
            this._unRegister();
        }
    }

    @HostListener('document:click', [`$event.target`])
    onMouseClick(target: any): void {
        if (this.isOpen) {
            let current: any = target; // Get the element in the DOM on which the mouse was clicked
            const host: HTMLElement = this.elementRef.nativeElement; // Get the current dropdown native HTML element

            // Start checking if current and dropdownHost are equal. If not traverse to the parentNode and check again.
            while (current) {
                if (current === host) {
                    return;
                }
                current = current.parentNode;
            }
            this.isOpen = false; // Close dropdown
        }
    }
}

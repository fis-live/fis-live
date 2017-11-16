import { animate, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input,
    Output, Renderer2
} from '@angular/core';

import { AbstractPopover } from '../utils/abstract-popover';

@Component({
    selector: 'app-dropdown',
    template: `
        <button class="dropdown-toggle btn btn-sm" (click)="toggle()" type="button">
            {{ (selected != null) ? selected.name : placeholder }}
            <clr-icon shape="caret" dir="down"></clr-icon>
        </button>

        <div *ngIf="open" [@animate] class="dropdown-menu" style="transform-origin: top center;">
            <ng-content></ng-content>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            transition(':enter', [
                style({opacity: 0, transform: 'scaleY(0)'}),
                animate('200ms ease', style({opacity: 1, transform: 'scaleY(1)'}))
            ]),
            transition(':leave', [
                animate('200ms ease', style({opacity: 0, transform: 'scaleY(0)'}))
            ])
        ])
    ]
})
export class DropdownComponent extends AbstractPopover {

    @Output() public selectedChange: EventEmitter<any> = new EventEmitter();
    @Input() public selected: any;
    @Input() public placeholder: string;

    constructor(el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    public select(item: any) {
        if (this.selected !== item) {
            this.selectedChange.emit(item);
        }

        this.toggle();
        this.cdr.detectChanges();
    }
}

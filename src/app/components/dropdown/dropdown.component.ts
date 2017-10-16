import { Input, Component, ChangeDetectionStrategy, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { style, animate, trigger, transition } from '@angular/animations';
import { AbstractPopover } from '../utils/abstract-popover';

@Component({
    selector: 'app-dropdown',
    template: `
        <button class="dropdown-toggle btn btn-sm btn-primary" (click)="toggle()" type="button">
            {{ text }}
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

    @Input() public text: string;

    constructor(el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }
}

import {
    Input, Component, ChangeDetectionStrategy, ElementRef, Renderer2, ChangeDetectorRef,
    EventEmitter, Output
} from '@angular/core';
import { style, animate, trigger, transition } from '@angular/animations';
import { AbstractPopover } from '../utils/abstract-popover';

@Component({
    selector: 'app-dropdown',
    template: `
        <button class="dropdown-toggle btn btn-sm" (click)="toggle()" type="button">
            {{ text || placeholder }}
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

    public selectedItem: any;
    public text: string = '';
    @Output() public onSelected: EventEmitter<any> = new EventEmitter();
    @Input() public placeholder: string;

    constructor(el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    public select(item: any) {
        if (this.selectedItem !== item) {
            this.text = item.default_text;
            this.selectedItem = item;
            this.onSelected.emit(item);
        }

        this.toggle();
        this.cdr.detectChanges();
    }
}

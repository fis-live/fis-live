import {
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectionStrategy, ElementRef, Renderer2, ChangeDetectorRef
} from '@angular/core';
import { style, animate, trigger, transition } from '@angular/animations';
import { AbstractPopover } from './utils/abstract-popover';

export interface DropdownItem {
    data_value: any;
    selected_text: string;
    default_text: string;
}

@Component({
    selector: 'app-dropdown',
    template: `
    <div [attr.class]="'ui scrolling dropdown ' + cssClass" (click)="toggle()" [class.active]="open">
        <div class="text">{{ getText() }}</div>
        <i class="dropdown icon"></i>

        <div class="visible menu" *ngIf="open" [@animate]>
            <div *ngFor="let item of items"
                [ngClass]="{'selected active': selectedItem == item}"
                (click)="select(item)" class="item">{{ item.default_text }}</div>
        </div>
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
    ],
})
export class DropdownComponent extends AbstractPopover {

    @Output()
    public selectedChanged: EventEmitter<DropdownItem> = new EventEmitter<DropdownItem>();

    @Input()
    public placeholder: string;

    @Input()
    public cssClass: string;

    @Input()
    public set items(items: DropdownItem[]) {
        this._items = items;
        if (items != null && items.length > 0) {
            if (typeof this.selectedItem !== 'undefined' && this.selectedItem !== null) {
                const item = items.find(itm => itm.data_value === this.selectedItem.data_value);
                if (typeof item !== 'undefined') {
                    this.select(item);
                } else {
                    this.select(items[0]);
                }
            } else {
                this.select(items[0]);
            }
        } else {
            this.hasSelected = false;
            this.selectedChanged.emit(null);
        }
    }

    public get items(): DropdownItem[] {
        return this._items;
    }

    private _items: DropdownItem[];

    public selectedItem: DropdownItem;
    public hasSelected = false;

    constructor(el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    public getText(): string {
        if (this.hasSelected) {
            return this.selectedItem.selected_text;
        }

        return this.placeholder;
    }

    public select(item: DropdownItem): void {
        this.selectedChanged.emit(item);

        this.selectedItem = item;
        this.hasSelected = true;
    }
}

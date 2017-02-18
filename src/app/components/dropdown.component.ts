import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    ChangeDetectionStrategy,
    style,
    animate,
    trigger,
    transition,
    state, AnimationTransitionEvent
} from '@angular/core';

export interface DropdownItem {
    data_value: any;
    selected_text: string;
    default_text: string;
}

@Component({
    selector: 'app-dropdown',
    template: `
    <div [attr.class]="'ui scrolling dropdown ' + cssClass" (click)="toggleDropdown()" [ngClass]="{'active visible': isOpen}">
        <div class="text" [ngClass]="{'default': !hasSelected}">{{ getText() }}</div>
        <i class="dropdown icon"></i>
        
        <div class="menu"
            (@animate.start)="animationStarted($event)"
            (@animate.done)="animationDone($event)"
            [class.visible]="isVisible"
            [@animate]="isOpen ? 'visible' : 'hidden'">
            <div *ngFor="let item of items"
                [ngClass]="{'selected active': selectedItem == item}"
                (click)="select(item)" class="item">{{ item.default_text }}</div>
        </div>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            state('hidden', style({opacity: 0, transform: 'scaleY(0)'})),
            state('visible', style({opacity: 1, transform: 'scaleY(1)'})),
            transition('hidden <=> visible', animate('200ms ease'))
        ])
    ],
})
export class DropdownComponent {

    @Output()
    public selectedChanged: EventEmitter<DropdownItem> = new EventEmitter<DropdownItem>();

    @Input()
    public placeholder: string;

    @Input()
    public cssClass: string;

    @Input()
    public items: DropdownItem[];

    public selectedItem: DropdownItem;
    public hasSelected = false;
    public isOpen = false;
    public isVisible = false;

    constructor(private elementRef: ElementRef) { }


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

    public toggleDropdown(): void {
        this.isOpen = !this.isOpen;
    }

    public animationStarted($event: AnimationTransitionEvent): void {
        if ($event.fromState === 'hidden') {
            this.isVisible = true;
        }
    }

    public animationDone($event: AnimationTransitionEvent): void {
        if ($event.fromState === 'visible') {
            this.isVisible = false;
        }
    }

    public setSelected(data_value: any): void {
        if (data_value != null) {
            const selected = this.items.find((item) => item.data_value === data_value);
            this.select(selected);
        } else {
            this.selectedItem = null;
            this.hasSelected = false;
            this.selectedChanged.emit(null);
        }
    }

    // called on mouse clicks anywhere in the DOM.
    // Checks to see if the mouseclick happened on the host or outside
    @HostListener('document:click', [`$event.target`])
    onMouseClick(target: any): void {
        if (this.isOpen) {
            let current: any = target; // Get the element in the DOM on which the mouse was clicked
            const dropdownHost: any = this.elementRef.nativeElement; // Get the current dropdown native HTML element

            // Start checking if current and dropdownHost are equal. If not traverse to the parentNode and check again.
            while (current) {
                if (current === dropdownHost) {
                    return;
                }
                current = current.parentNode;
            }
            this.isOpen = false; // Close dropdown
        }
    }
}

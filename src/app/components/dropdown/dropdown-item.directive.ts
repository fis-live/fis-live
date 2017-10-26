import { Directive, Input, HostBinding, HostListener } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Directive({selector: '[appDropdownItem]'})
export class DropdownItemDirective {
    constructor(private dropdown: DropdownComponent) { }

    @Input() appDropdownItem: any;

    @Input()
    @HostBinding('class.disabled')
    disabled: boolean = false;

    @HostBinding('class.active')
    public get active() {
        return this.dropdown.selectedItem === this.appDropdownItem;
    }

    @HostListener('click')
    public onDropdownItemClick(): void {
        if (!this.disabled) {
            this.dropdown.select(this.appDropdownItem);
        }
    }
}

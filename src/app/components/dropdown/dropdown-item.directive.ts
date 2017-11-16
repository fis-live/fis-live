import { Directive, HostBinding, HostListener, Input } from '@angular/core';

import { DropdownComponent } from './dropdown.component';

@Directive({selector: '[appDropdownItem]'})
export class DropdownItemDirective {
    @Input() public appDropdownItem: any;

    @Input()
    @HostBinding('class.disabled')
    public disabled: boolean = false;

    @HostBinding('class.active')
    public get active() {
        return this.dropdown.selected === this.appDropdownItem;
    }

    constructor(private dropdown: DropdownComponent) { }

    @HostListener('click')
    public onDropdownItemClick(): void {
        if (!this.disabled) {
            this.dropdown.select(this.appDropdownItem);
        }
    }
}

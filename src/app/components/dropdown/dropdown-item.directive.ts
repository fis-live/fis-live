import { Directive, HostListener } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Directive({selector: '[appDropdownItem]'})
export class DropdownItemDirective {
    constructor(private dropdown: DropdownComponent) { }

    @HostListener('click')
    public onDropdownItemClick(): void {
        this.dropdown.toggle();
    }
}

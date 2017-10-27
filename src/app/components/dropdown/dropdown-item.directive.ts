import { Directive, Input, HostBinding, HostListener, ElementRef } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Directive({selector: '[appDropdownItem]'})
export class DropdownItemDirective {
    @Input() appDropdownItem: any;

    @Input()
    @HostBinding('class.disabled')
    disabled: boolean = false;

    @HostBinding('class.active')
    public get active() {
        return this.dropdown.selected === this.appDropdownItem;
    }

    constructor(private dropdown: DropdownComponent, private el: ElementRef) { }

    @HostListener('click')
    public onDropdownItemClick(): void {
        if (!this.disabled) {
            this.dropdown.select(this.appDropdownItem, this.el.nativeElement.innerHTML);
        }
    }
}

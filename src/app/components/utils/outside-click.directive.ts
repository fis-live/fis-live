import { Directive, ElementRef, HostListener } from '@angular/core';
import { IfOpenService } from './if-open.service';

@Directive({selector: '[appOutsideClick]'})
export class OutsideClickDirective {
    constructor(private el: ElementRef, private openService: IfOpenService) {}

    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
        const target = event.target;         // Get the element in the DOM on which the mouse was clicked
        const host = this.el.nativeElement.parentNode;  // Get the current actionMenu native HTML element

        if (target === host || host.contains(target)) {
            return;
        }

        this.openService.open = false;
    }
}

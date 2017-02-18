import { ElementRef, Renderer, Directive, OnInit } from '@angular/core';

@Directive({
    selector : '[focusOnInit]'
})
export class FocusDirective implements OnInit {
    constructor(public renderer: Renderer, public elementRef: ElementRef) {}

    ngOnInit() {
        console.log('On init focus');
        this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
    }
}
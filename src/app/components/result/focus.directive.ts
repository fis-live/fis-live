import { ElementRef, Renderer, Directive, OnInit } from '@angular/core';

@Directive({
    selector : '[focusOnInit]'
})
export class FocusDirective implements OnInit {
    constructor(public renderer: Renderer, public elementRef: ElementRef) {}

    ngOnInit() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
    }
}
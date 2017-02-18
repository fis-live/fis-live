import { OnInit, OnDestroy, Directive, ElementRef } from '@angular/core';

import * as ps from 'perfect-scrollbar';

@Directive({
    selector: '[appScrollbar]'
})
export class ScrollbarDirective implements OnInit, OnDestroy {

    public observer: MutationObserver;

    constructor (private el: ElementRef) { }

    ngOnInit() {
        ps.initialize(this.el.nativeElement);

        this.observer = new MutationObserver(mutations => {
            this.update();
        });
        const config = { subtree: true, attributes: false, childList: true, characterData: true };

        this.observer.observe(this.el.nativeElement, config);
    }

    ngOnDestroy() {
        this.observer.disconnect();
        ps.destroy(this.el.nativeElement);
    }

    public update(): void {
        ps.update(this.el.nativeElement);
    }
}
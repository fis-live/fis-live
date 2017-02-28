import { OnInit, OnDestroy, Directive, ElementRef } from '@angular/core';

import * as ps from 'perfect-scrollbar';

@Directive({
    selector: '[appScrollbar]'
})
export class ScrollbarDirective implements OnInit, OnDestroy {

    public observer: MutationObserver;

    constructor (private el: ElementRef) { }

    ngOnInit() {
        if (this.getScrollbarWidth() > 0) {
            ps.initialize(this.el.nativeElement, {
                wheelSpeed: 2
            });

            this.observer = new MutationObserver(mutations => {
                this.update();
            });
            const config = {subtree: true, attributes: false, childList: true, characterData: true};

            this.observer.observe(this.el.nativeElement, config);
        }
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
            ps.destroy(this.el.nativeElement);
        }
    }

    public update(): void {
        ps.update(this.el.nativeElement);
    }

    public getScrollbarWidth() {
        const e = document.createElement('div');
        e.style.position = 'absolute';
        e.style.top = '-9999px';
        e.style.width = '100px';
        e.style.height = '100px';
        e.style.overflow = 'scroll';
        e.style.msOverflowStyle = 'scrollbar';

        document.body.appendChild(e);
        const width = (e.offsetWidth - e.clientWidth);
        document.body.removeChild(e);

        return width;
    }
}

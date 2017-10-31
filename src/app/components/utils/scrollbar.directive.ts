import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import PerfectScrollbar from 'perfect-scrollbar';

@Directive({
    selector: '[appScrollbar]'
})
export class ScrollbarDirective implements OnInit, OnDestroy {

    public observer: MutationObserver;
    private ps: PerfectScrollbar;

    constructor (private el: ElementRef) { }

    ngOnInit() {
        if (this.getScrollbarWidth() > 0) {
            this.ps = new PerfectScrollbar(this.el.nativeElement, {
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
            this.ps.destroy();
        }
    }

    public update(): void {
        this.ps.update();
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

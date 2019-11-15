import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

@Directive({
    selector: '[appScrollbar]'
})
export class ScrollbarDirective implements OnInit, OnDestroy {
    private observer?: MutationObserver;
    private ps?: PerfectScrollbar;

    constructor (private el: ElementRef) { }

    ngOnInit() {
        if (ScrollbarDirective.getScrollbarWidth() > 0) {
            this.ps = new PerfectScrollbar(this.el.nativeElement, {
                wheelSpeed: 2
            });

            this.observer = new MutationObserver(() => {
                this.update();
            });

            const config = {subtree: true, attributes: false, childList: true, characterData: true};

            this.observer.observe(this.el.nativeElement, config);
        }
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.ps) {
            this.ps.destroy();
        }
    }

    update() {
        if (this.ps) {
            this.ps.update();
        }
    }

    private static getScrollbarWidth() {
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

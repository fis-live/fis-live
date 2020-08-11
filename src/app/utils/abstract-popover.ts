import { ChangeDetectorRef, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive()
export abstract class AbstractPopover implements OnDestroy {

    public open: boolean = false;
    private documentListener?: () => void;

    protected constructor(protected host: ElementRef, protected renderer: Renderer2, protected cdr: ChangeDetectorRef) { }

    public toggle() {
        this.open = !this.open;
        if (this.open) {
            this.attachOutsideClickListener();
        } else {
            this.detachOutsideClickListener();
        }
    }

    private attachOutsideClickListener() {
        this.documentListener = this.renderer.listen('document', 'click', event => {
            const target = event.target;

            if (target.localName === 'body' || target === this.host.nativeElement || this.host.nativeElement.contains(target)) {
                return;
            }

            this.toggle();
            this.cdr.detectChanges();
        });
    }

    private detachOutsideClickListener() {
        if (this.documentListener) {
            this.documentListener();
            delete this.documentListener;
        }
    }

    public ngOnDestroy() {
        this.detachOutsideClickListener();
    }
}

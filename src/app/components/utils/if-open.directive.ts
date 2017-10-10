import {
    Directive, EventEmitter, Input, OnDestroy, Output, TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IfOpenService } from './if-open.service';

@Directive({selector: '[appIfOpen]'})
export class IfOpenDirective implements OnDestroy {
    private subscription: Subscription;

    @Input()
    public set open(value: boolean) {
        this.ifOpenService.open = value;
    }

    @Output() openChange: EventEmitter<boolean> = new EventEmitter<boolean>(false);
    public get open() {
        return this.ifOpenService.open;
    }

    constructor(private ifOpenService: IfOpenService, private template: TemplateRef<any>,
                private container: ViewContainerRef) {
        this.subscription = this.ifOpenService.openChange.subscribe((change) => {
            this.updateView(change);
            this.openChange.emit(change);
        });
    }

    public updateView(value: boolean) {
        if (value) {
            this.container.createEmbeddedView(this.template);
        } else {
            this.container.clear();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

import { OnInit, OnDestroy, Directive, ElementRef, Output, EventEmitter } from '@angular/core';

const elementResizeDetectorMaker = require('element-resize-detector');

export interface Dimensions {
    width: number;
    height: number;
}

@Directive({
    selector: '[dimensions]'
})
export class DimensionsDirective implements OnInit, OnDestroy {

    private observer: any;

    @Output() onDimensionsChange: EventEmitter<Dimensions> = new EventEmitter();

    constructor (private el: ElementRef) { }

    ngOnInit(){
        this.observer = elementResizeDetectorMaker({
            strategy: 'scroll'
        });

        this.observer.listenTo(this.el.nativeElement, element => {
            let width = element.offsetWidth;
            let height = element.offsetHeight;

            this.onDimensionsChange.emit({width: width, height: height});
        });
    }

    ngOnDestroy() {
        this.observer.uninstall(this.el.nativeElement);
    }
}
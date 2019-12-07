import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren,
    ElementRef, OnDestroy, QueryList, Renderer2
} from '@angular/core';

import { AbstractPopover } from '../../utils/abstract-popover';

import { ExactFilter, NewFilter } from './filter';
import { FilterOptions } from './options';

@Component({
    selector: 'app-new-filter',
    templateUrl: './filter.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewFilterComponent<T> extends AbstractPopover implements OnDestroy {

    @ContentChildren(FilterOptions) public options!: QueryList<FilterOptions<T>>;

    public input: string | null = null;

    constructor(public filter: NewFilter<T>, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    onFocus() {
        if (this.input !== null && this.input.length > 0) {
            if (!this.open) { this.toggle(); }
        } else {
            if (this.open) { this.toggle(); }
        }
    }

    filterChanged() {
        if (this.input !== null && this.input.length > 0) {
            if (!this.open) { this.toggle(); }
            this.options.forEach((options) => {
                if (this.input != null) {
                    options.search(this.input);
                }
            });

            this.cdr.detectChanges();
        } else {
            if (this.open) { this.toggle(); }
        }
    }

    public reset(): void {
        this.input = null;
        this.toggle();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}

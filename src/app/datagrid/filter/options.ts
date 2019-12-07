import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';

import { NewFilter } from './filter';

@Component({
    selector: 'app-filter-options',
    template: `
        <h4 class="dropdown-header">{{ name }}</h4>
        <div class="dropdown-item" *ngFor="let option of filteredOptions" (click)="select(option)">
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{$implicit: option}"></ng-container>
        </div>
    `,
})
export class FilterOptions<T> {
    @Input() name = '';
    @Input() options: string[] | null = [];
    filteredOptions: string[] = [];
    @Input() filterBy: (option: T) => string = () => '';

    @ContentChild(TemplateRef, {static: true}) template!: TemplateRef<{$implicit: string}>;

    constructor(private filter: NewFilter<T>) { }

    search(term: string) {
        this.filteredOptions = this.options!.filter((option) => option.toLowerCase().indexOf(term.toLowerCase()) >= 0);
        console.log(this.filteredOptions);
    }

    select(option: string) {
        this.filter.toggle({
            isExact: true,
            filterBy: this.filterBy,
            term: option
        });
    }
}

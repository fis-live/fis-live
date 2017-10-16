import {
    Component, Input, ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'app-grid-header',
    template: `
        <div class="btn-group btn-primary">
            <app-dropdown class="dropdown" [placeholder]="'Intermediate...'" (onSelected)="setSelected($event)">
                <button *ngFor="let item of items" [appDropdownItem]="item"
                         class="dropdown-item">{{ item.default_text }}</button>
            </app-dropdown>

            <app-dropdown class="dropdown" [placeholder]="'Diff...'" (onSelected)="setSelected($event)">
                <button *ngFor="let item of items" [appDropdownItem]="item"
                        [disabled]="!inter || item.data_value >= inter" class="dropdown-item">{{ item.default_text }}</button>
            </app-dropdown>
        </div>
        <div style="flex: 1 1 auto">
                    james@test.com
        </div>
        <div class="column-switch-wrapper">
            <button class="btn btn-sm btn-link column-toggle--action" type="button">
                <clr-icon shape="view-columns"></clr-icon>
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeaderComponent {
    public inter: number;
    @Input() public items: any;

    constructor() { }

    public setSelected(item: any) {
        this.inter = item.data_value;
    }
}

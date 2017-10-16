import {
    Component, Input, ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'app-grid-header',
    template: `
        <div class="btn-group btn-primary">
            <app-dropdown class="dropdown" [text]="text">
                <button *ngFor="let item of items" appDropdownItem (click)="setSelected(item)"
                         class="dropdown-item" [class.active]="item.data_value == selected">{{ item.default_text }}</button>
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
    @Input() public items: any;

    public text = 'Select intermediate...';
    public selected: any;

    constructor() { }

    public setSelected(item: any) {
        this.text = item.default_text;
        this.selected = item.data_value;
    }
}

import {
    Component, Input, ChangeDetectionStrategy,
} from '@angular/core';
import {DatagridState} from "./providers/datagrid-state";

@Component({
    selector: 'app-grid-header',
    template: `
        <div class="btn-group">
            <app-dropdown class="dropdown btn-primary" [placeholder]="'Intermediate...'" (onSelected)="setSelected($event)">
                <button *ngFor="let item of items" [appDropdownItem]="item"
                         class="dropdown-item">{{ item.default_text }}</button>
            </app-dropdown>

            <app-dropdown class="dropdown btn-success" [placeholder]="'Diff...'" (onSelected)="setSelected($event)">
                <button *ngFor="let item of items" [appDropdownItem]="item"
                        [disabled]="!inter || item.data_value >= inter" class="dropdown-item">{{ item.default_text }}</button>
            </app-dropdown>
        </div>
        <div style="flex: 1 1 auto">
        </div>
        <app-dg-settings class="column-switch-wrapper"></app-dg-settings>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeaderComponent {
    public inter: number;
    @Input() public items: any;

    constructor(private _state: DatagridState) { }

    public setSelected(item: any) {
        this.inter = item.data_value;
        this._state.setInter(this.inter);
    }
}

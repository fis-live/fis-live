import {
    Component, Input, ChangeDetectionStrategy,
} from '@angular/core';
import { DatagridState } from './providers/datagrid-state';
import { Intermediate } from '../../models/intermediate';

@Component({
    selector: 'app-grid-header',
    template: `
        <div class="btn-group">
            <app-dropdown class="dropdown btn-primary" [placeholder]="'Intermediate...'" [(selected)]="inter">
                <button *ngFor="let item of items" [appDropdownItem]="item"
                         class="dropdown-item">{{ item.name }}</button>
            </app-dropdown>

            <app-dropdown class="dropdown btn-success" [placeholder]="'Diff...'" [(selected)]="diff">
                <button *ngFor="let item of items.slice(0, -1)" [appDropdownItem]="item"
                        [disabled]="inter == null || (item.key !== 0 && item.key >= inter.key)"
                        class="dropdown-item">{{ item.distance }} KM</button>
            </app-dropdown>
        </div>
        <div style="flex: 1 1 auto">
        </div>
        <app-dg-settings class="column-switch-wrapper"></app-dg-settings>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeaderComponent {
    private _inter: Intermediate;
    private _diff: Intermediate;
    private _items: Intermediate[] = [];

    @Input() public set items(items: Intermediate[]) {
        if (items == null) {
            this.inter = null;
            this.diff = null;
        } else if (items.length > 0 && items.length !== this._items.length ) {
            this.inter = items[0];
            this.diff = null;
        }

        this._items = items;
    }

    public get items(): Intermediate[] {
        return this._items;
    }

    constructor(private _state: DatagridState) { }

    public set inter(item: Intermediate) {
        if (item !== null) {
            this._inter = item;
            if (this.diff != null && item.key >= this.diff.key) {
                this.diff = null;
            }

            this._state.setInter(this.inter.key);
        } else {
            this._inter = item;
            this.diff = null;
            this._state.setInter(null);
        }
    }

    public get inter() {
        return this._inter;
    }

    public set diff(item: Intermediate) {
        this._diff = item;
        this._state.setDiff((item != null) ? item.key : null);
    }

    public get diff() {
        return this._diff;
    }
}

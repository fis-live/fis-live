import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DatagridState } from './providers/datagrid-state';

@Component({
    selector: 'app-grid-header',
    template: `
        <div class="btn-group">
            <app-select class="btn-primary" key="inter">
                Intermediate...
                <ng-template let-item>{{ item.name }}</ng-template>
            </app-select>

            <app-select *ngIf="config.diff" class="btn-success" key="diff">
                Diff...
                <ng-template let-item>{{ item.distance }} KM</ng-template>
            </app-select>
        </div>
        <!--div style="flex: 1 1 auto">
        </div>
        <app-dg-settings class="column-switch-wrapper"></app-dg-settings-->
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeaderComponent {
    @Input() config: any;
}

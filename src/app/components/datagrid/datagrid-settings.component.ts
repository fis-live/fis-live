import { Component, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';

import { AbstractPopover } from '../utils/abstract-popover';
import { DatagridState } from './providers/datagrid-state';

@Component({

    selector: 'app-dg-settings',
    template: `
            <button (click)="toggle()" class="btn btn-sm btn-link column-toggle--action" type="button">
                <clr-icon shape="view-columns"></clr-icon>
            </button>

            <div class="column-switch" *ngIf="open">
                <div class="switch-header">
                    Show Columns
                    <button (click)="toggle()" class="btn btn-sm btn-link" type="button">
                        <clr-icon shape="times"></clr-icon>
                    </button>
                </div>
                <ul class="switch-content list-unstyled">
                    <li class="checkbox" *ngFor="let col of columns">
                        <input type="checkbox"
                               [checked]="visibleColumns.indexOf(col) > -1" [id]="col" (change)="toggleColumn(col)">
                        <label [for]="col">{{ col }}</label>
                    </li>
                </ul>
                <div class="switch-footer">
                    <div>
                        <button
                                class="btn btn-sm btn-link p6 text-uppercase"
                                type="button">Select All
                        </button>
                    </div>
                    <div class="action-right">
                        <button (click)="toggle()"
                                class="btn btn-primary"
                                type="button">
                            Ok
                        </button>
                    </div>
                </div>
            </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridSettingsComponent extends AbstractPopover {
    public columns: string[] = ['rank', 'bib', 'name', 'time', 'nation', 'diff'];
    public visibleColumns: string[] = ['rank', 'bib', 'name', 'time', 'nation', 'diff'];

    constructor(private _state: DatagridState, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }


    public toggleColumn(column: string) {
        const i = this.visibleColumns.indexOf(column);
        if (i > -1) {
            this.visibleColumns.splice(i, 1);
        } else {
            this.visibleColumns.push(column);
        }
        this._state.toggleColumn(column);
    }
}

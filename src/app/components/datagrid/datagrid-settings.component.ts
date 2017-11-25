import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';

import { AbstractPopover } from '../utils/abstract-popover';

import {Columns, DatagridState} from './providers/datagrid-state';
import {Observable} from 'rxjs/Observable';

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
                <ul class="switch-content list-unstyled" *ngIf="columns$ | async as columns">
                    <li class="checkbox">
                        <input type="checkbox"
                               [checked]="columns.bib" id="bib" (change)="toggleColumn('bib')">
                        <label for="bib">Bib</label>
                    </li>
                    <li class="checkbox">
                        <input type="checkbox"
                               [checked]="columns.nationality" id="nation" (change)="toggleColumn('nationality')">
                        <label for="nation">Nationality</label>
                    </li>
                    <li class="checkbox">
                        <input type="checkbox"
                               [checked]="columns.diff" id="diff" (change)="toggleColumn('diff')">
                        <label for="diff">Diff</label>
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
    public columns$: Observable<Columns>;
    public visibleColumns: string[] = ['rank', 'bib', 'name', 'time', 'nation', 'diff'];

    constructor(private _state: DatagridState, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);

        this.columns$ = this._state.getVisibleColumns();
    }


    public toggleColumn(column: keyof Columns) {
        this._state.toggleColumn(column);
    }
}

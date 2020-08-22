import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Column } from '../models/table';
import { AbstractPopover } from '../utils/abstract-popover';

import { DatagridStore } from './providers/config';

@Component({
    selector: 'app-dg-settings',
    templateUrl: './datagrid-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridSettingsComponent extends AbstractPopover {
    public columns$: Observable<Column[]>;
    public tickerEnabled$: Observable<boolean>;

    constructor(private _config: DatagridStore, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);

        this.tickerEnabled$ = this._config.select(state => state.tickerEnabled);
        this.columns$ = this._config.state$.pipe(
            select((state) => {
                if (state.view.mode === 'normal') {
                    return state.columns.filter((col) => !col.isDynamic);
                }

                return state.columns;
            })
        );
    }

    public toggleTicker(checked: boolean) {
        this._config.setTicker(checked);
    }

    public toggleColumn(column: string) {
        this._config.toggleColumn(column);
    }

    public onDrop(event: CdkDragDrop<string[]>) {
        this._config.reorderColumn(event);
    }

    public trackBy(index: number, column: Column) {
        return column.id;
    }
}

import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Column } from '../models/table';
import { AbstractPopover } from '../utils/abstract-popover';

import { DatagridConfig } from './providers/config';

@Component({
    selector: 'app-dg-settings',
    templateUrl: './datagrid-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridSettingsComponent extends AbstractPopover {
    public columns$: Observable<Column[]>;

    constructor(private _config: DatagridConfig, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);

        this.columns$ = this._config.getConfig().pipe(
            select((state) => {
                if (state.view.mode === 'normal') {
                    return state.columns.filter((col) => !col.isDynamic);
                }

                return state.columns;
            })
        );
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

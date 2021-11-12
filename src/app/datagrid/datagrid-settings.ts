import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';

import { AbstractPopover } from '../utils/abstract-popover';

import { DatagridStore } from './state/datagrid-store';
import { Column } from './state/model';

@Component({
    selector: 'app-dg-settings',
    templateUrl: './datagrid-settings.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridSettings extends AbstractPopover {
    public columns$: Observable<Column[]>;
    public tickerEnabled$: Observable<boolean>;
    public usePercent$: Observable<boolean>;
    public nameFormat$: Observable<string>;

    constructor(private store: DatagridStore, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);

        this.tickerEnabled$ = this.store.select(state => state.tickerEnabled);
        this.usePercent$ = this.store.select(state => state.view.usePercent);
        this.columns$ = this.store.select((state) => {
            if (state.view.mode === 'normal') {
                return state.columns.filter((col) => !col.isDynamic);
            }

            return state.columns;
        });
        this.nameFormat$ = this.store.select((state) => {
            return state.nameFormat;
        });
    }

    public toggleTicker(checked: boolean) {
        this.store.setTicker(checked);
    }

    public toggleUsePercent(checked: boolean) {
        this.store.setUsePercent(checked);
    }

    public toggleColumn(column: string) {
        this.store.toggleColumn(column);
    }

    public setNameFormat(format: string) {
        this.store.setNameFormat(format);
    }

    public onDrop(event: CdkDragDrop<string[]>) {
        this.store.reorderColumn(event);
    }

    public trackBy(index: number, column: Column) {
        return column.id;
    }
}

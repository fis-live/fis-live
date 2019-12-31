import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { KeysOfType, Option, OptionSelector } from '../../core/select/option-selector';
import { Intermediate } from '../../models/intermediate';
import { Column, ColumnDef } from '../../models/table';
import { AppState, selectAllIntermediates } from '../../state/reducers';

export interface View {
    mode: 'normal' | 'analysis';
    inter: Intermediate | null;
    diff: Intermediate | null;
    zero: number;
    display: 'total' | 'diff';
}

export interface Config {
    view: View;
    isStartList: boolean;
    displayedColumns: string[];
    breakpoint: string;
    dynamicColumns: ColumnDef[];
    columns: Column[];
    tickerEnabled: boolean;
}

function clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
}

const defaultColumns = [
    { id: 'order', name: '#', toggled: false, isDynamic: false },
    { id: 'rank', name: 'Rank', toggled: true, isDynamic: false },
    { id: 'bib', name: 'Bib', toggled: true, isDynamic: false },
    { id: 'name', name: 'Name', toggled: true, isDynamic: false },
    { id: 'time', name: 'Time', toggled: true, isDynamic: false },
    { id: 'nsa', name: 'NSA', toggled: true, isDynamic: false },
    { id: 'diff', name: 'Diff.', toggled: true, isDynamic: false },
    { id: 'tour', name: 'Tour Std.', toggled: false, isDynamic: false }
];

const defaultColumnsSmall = [
    { id: 'order', name: '#', toggled: false, isDynamic: false },
    { id: 'rank', name: 'Rank', toggled: true, isDynamic: false },
    { id: 'bib', name: 'Bib', toggled: true, isDynamic: false },
    { id: 'name', name: 'Name', toggled: true, isDynamic: false },
    { id: 'time', name: 'Time', toggled: true, isDynamic: false },
    { id: 'nsa', name: 'NSA', toggled: false, isDynamic: false },
    { id: 'diff', name: 'Diff.', toggled: true, isDynamic: false },
    { id: 'tour', name: 'Tour Std.', toggled: false, isDynamic: false }
];

const defaultColumnsMini = [
    { id: 'order', name: '#', toggled: false, isDynamic: false },
    { id: 'rank', name: 'Rank', toggled: true, isDynamic: false },
    { id: 'bib', name: 'Bib', toggled: false, isDynamic: false },
    { id: 'name', name: 'Name', toggled: true, isDynamic: false },
    { id: 'time', name: 'Time', toggled: true, isDynamic: false },
    { id: 'nsa', name: 'NSA', toggled: false, isDynamic: false },
    { id: 'diff', name: 'Diff.', toggled: false, isDynamic: false },
    { id: 'tour', name: 'Tour Std.', toggled: false, isDynamic: false }
];

const defaultAnalysisColumns = [
    { id: 'order', name: '#', toggled: true, isDynamic: false },
    { id: 'rank', name: 'Rank', toggled: false, isDynamic: false },
    { id: 'bib', name: 'Bib', toggled: true, isDynamic: false },
    { id: 'name', name: 'Name', toggled: true, isDynamic: false },
    { id: 'time', name: 'Time', toggled: false, isDynamic: false },
    { id: 'nsa', name: 'NSA', toggled: false, isDynamic: false },
    { id: 'diff', name: 'Diff.', toggled: false, isDynamic: false },
    { id: 'tour', name: 'Tour Std.', toggled: false, isDynamic: false }
];

const defaultConfig: Config = {
    view: {
        mode: 'normal',
        inter: null,
        diff: null,
        zero: -1,
        display: 'total'
    },
    isStartList: true,
    displayedColumns: ['rank', 'bib', 'name', 'time', 'nsa', 'diff'],
    breakpoint: 'large',
    dynamicColumns: [],
    columns: defaultColumns,
    tickerEnabled: false
};

@Injectable()
export class DatagridConfig implements OptionSelector<View, Intermediate>, OnDestroy {
    private _internalConfig: Config = defaultConfig;
    private _config: BehaviorSubject<Config> = new BehaviorSubject(defaultConfig);
    private _subscription: Subscription;
    private _valueChanged = new BehaviorSubject<View>(this._internalConfig.view);
    private _renderSelectionChanged = new BehaviorSubject<View>(this._internalConfig.view);
    private _source: Observable<Intermediate[]>;

    constructor(private store: Store<AppState>) {
        this._source = store.pipe(
            select(selectAllIntermediates)
        );

        this._subscription = this._source.subscribe((values) => {
            const view = {...this._internalConfig.view};
            const columns = this._internalConfig.columns.filter((column) => !column.isDynamic);
            const dynamicColumns = [];
            for (const intermediate of values) {
                if (intermediate.type === 'bonus_points') {
                    continue;
                }

                dynamicColumns.push({
                    id: 'inter' + intermediate.key,
                    sortBy: 'marks.' + intermediate.key + '.value',
                    name: intermediate.short,
                    key: intermediate.key
                });

                columns.push({
                    id: 'inter' + intermediate.key,
                    name: intermediate.short,
                    toggled: intermediate.type !== 'start_list' && view.mode === 'analysis',
                    isDynamic: true
                });
            }

            if (view.mode === 'normal') {
                if (values.length > 0 && view.inter !== null) {
                    if (view.inter.key >= values.length) {
                        view.inter = values[0];
                        view.diff = null;
                    } else {
                        view.inter = values[view.inter.key];
                        view.diff = view.diff !== null ? values[view.diff.key] : null;
                    }
                } else {
                    view.inter = values.length > 0 ? values[0] : null;
                    view.diff = null;
                }

                this._internalConfig = {
                    ...this._internalConfig,
                    view,
                    dynamicColumns,
                    columns,
                    isStartList: view.inter == null || view.inter.key === 0
                };
                this._config.next(this._internalConfig);
                this._renderSelectionChanged.next(view);
            } else {
                this._internalConfig = {
                    ...this._internalConfig,
                    dynamicColumns,
                    columns,
                    displayedColumns: this.buildColumnList(columns)
                };

                this._config.next(this._internalConfig);
            }
        });
    }

    private resetColumns(mode: 'normal' | 'analysis') {
        const columns = mode === 'normal' ? [...defaultColumns] : [...defaultAnalysisColumns];
        for (const col of this._internalConfig.dynamicColumns) {
            columns.push({
                id: col.id,
                name: col.name,
                isDynamic: true,
                toggled: col.id !== 'inter0' && mode === 'analysis'
            });
        }

        return columns;
    }

    public setMode(mode: 'normal' | 'analysis') {
        const columns = this.resetColumns(mode);

        this._internalConfig = {
            ...this._internalConfig,
            view: {
                ...this._internalConfig.view,
                mode
            },
            columns,
            displayedColumns: this.buildColumnList(columns)
        };

        this._config.next(this._internalConfig);
    }

    public setDisplayMode(display: 'total' | 'diff') {
        this._internalConfig = {
            ...this._internalConfig,
            view: {
                ...this._internalConfig.view,
                display
            }
        };

        this._config.next(this._internalConfig);
    }

    public setZero(bib: number) {
        this._internalConfig = {
            ...this._internalConfig,
            view: {
                ...this._internalConfig.view,
                zero: bib
            }
        };

        this._config.next(this._internalConfig);
    }


    public getConfig(): Observable<Config> {
        return this._config.asObservable();
    }

    private buildColumnList(columns: Column[]) {
        return columns.reduce((cols, col) => {
            if (col.toggled) {
                cols.push(col.id);
            }

            return cols;
        }, [] as string[]);
    }

    public toggleColumn(columnId: string) {
        const colIdx = this._internalConfig.columns.findIndex((column) => column.id === columnId);
        const columns = this._internalConfig.columns.slice();
        if (colIdx > -1) {
            const col = {
                ...columns[colIdx],
                toggled: !columns[colIdx].toggled
            };

            columns[colIdx] = col;

            this._internalConfig = {
                ...this._internalConfig,
                columns: columns,
                displayedColumns: this.buildColumnList(columns)
            };

            this._config.next(this._internalConfig);
        }
    }

    public reorderColumn(event: CdkDragDrop<string[]>) {
        const array = this._internalConfig.columns.slice();
        const from = clamp(event.previousIndex, array.length - 1);
        const to = clamp(event.currentIndex, array.length - 1);

        if (from === to) {
            return;
        }

        const target = array[from];
        const delta = to < from ? -1 : 1;

        for (let i = from; i !== to; i += delta) {
            array[i] = array[i + delta];
        }

        array[to] = target;

        this._internalConfig = {
            ...this._internalConfig,
            columns: array,
            displayedColumns: this.buildColumnList(array)
        };

        this._config.next(this._internalConfig);
    }

    public setBreakpoint(breakpoint: string) {
        if (breakpoint === this._internalConfig.breakpoint) { return; }

        if (this._internalConfig.view.mode === 'normal') {
            let columns;
            if (breakpoint === 'large') {
                columns = [...defaultColumns];
            } else if (breakpoint === 'small') {
                columns = [...defaultColumnsSmall];
            } else {
                columns = [...defaultColumnsMini];
            }

            this._internalConfig = {
                ...this._internalConfig,
                columns,
                displayedColumns: this.buildColumnList(columns),
                breakpoint
            };
        } else {
            this._internalConfig = {
                ...this._internalConfig,
                breakpoint
            };
        }

        this._config.next(this._internalConfig);
    }

    getOptions(key: KeysOfType<View, Intermediate | null>): Observable<Option<Intermediate>[]> {
        if (key === 'diff') {
            return this._source.pipe(
                map((options) => options.filter(inter => inter.type !== 'bonus_points').map((option) => {
                        const inter = this._internalConfig.view.inter;
                        const curr = this._internalConfig.view[key];
                        const disabled = inter === null || inter.type === 'bonus_points' || (option.key !== 0 && option.key >= inter.key);
                        const selected = curr === option;

                        return { value: option, selected, disabled };
                    })
                )
            );
        }

        return this._source.pipe(
            map((options) => options.map((option) => {
                    const curr = this._internalConfig.view[key];
                    const disabled = false;
                    const selected = curr === option;

                    return { value: option, selected, disabled };
                })
            )
        );
    }

    getRenderSelectionChanged(key: KeysOfType<View, Intermediate | null>): Observable<Intermediate | null> {
        return this._renderSelectionChanged.asObservable().pipe(
            map(view => view[key])
        );
    }

    getValueChanged(): Observable<View> {
        return this._valueChanged.asObservable();
    }

    setSelected(value: View): void {
        // this.currentValue = value;
        // this._renderSelectionChanged.next(this.currentValue);
    }

    updateSelection(value: Intermediate, key: KeysOfType<View, Intermediate | null>): void {
        const view = {...this._internalConfig.view};
        if (view[key] && view[key] === value) {
            return;
        }

        view[key] = value;
        if (key === 'inter' && (value === null || value.type === 'bonus_points' || (view.diff != null && value.key <= view.diff.key))) {
            view.diff = null;
        }

        this._internalConfig = {
            ...this._internalConfig,
            view,
            isStartList: view.inter == null || view.inter.key === 0
        };
        this._config.next(this._internalConfig);
        this._renderSelectionChanged.next(view);
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    setTicker(checked: boolean) {
        this._internalConfig = {
            ...this._internalConfig,
            tickerEnabled: checked
        };

        this._config.next(this._internalConfig);
    }
}

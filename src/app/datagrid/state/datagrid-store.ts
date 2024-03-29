import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Option, OptionSelector } from '../../core/select/option-selector';
import { Intermediate } from '../../fis/cross-country/models';
import { isBonus } from '../../fis/fis-constants';
import { AppState, getSettingsState, selectAllIntermediates } from '../../state/reducers';
import { State as SettingsState } from '../../state/reducers/settings';

import { DatagridState, View } from './model';

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

const initialState: DatagridState = {
    view: {
        mode: 'normal',
        inter: null,
        diff: null,
        zero: -1,
        display: 'total',
        usePercent: false
    },
    isStartList: true,
    breakpoint: 'large',
    nameFormat: 'f l',
    dynamicColumns: [],
    columns: defaultColumns,
    tickerEnabled: false
};

@Injectable()
export class DatagridStore extends ComponentStore<DatagridState> implements OptionSelector<View, Intermediate> {
    private readonly _source = this.store.select(selectAllIntermediates);

    constructor(private store: Store<AppState>) {
        super(initialState);

        this.fromStore(store.select(getSettingsState).pipe(take(1)));
        this.setIntermediates(this._source);
    }

    private resetColumns(mode: 'normal' | 'analysis') {
        const columns = mode === 'normal' ? [...defaultColumns] : [...defaultAnalysisColumns];
        for (const col of this.get().dynamicColumns) {
            columns.push({
                id: col.id,
                name: col.name,
                isDynamic: true,
                toggled: col.id !== 'inter0' && mode === 'analysis'
            });
        }

        return columns;
    }

    private readonly fromStore = this.updater((state, settings: SettingsState) => {
        return {
            ...state,
            columns: settings.defaultColumns,
            tickerEnabled: settings.tickerEnabled,
            nameFormat: settings.nameFormat
        };
    });

    private readonly setIntermediates = this.updater((state, values: Intermediate[]) => {
        const view = {...state.view};
        const columns = state.columns.filter((column) => !column.isDynamic);
        const dynamicColumns = [];
        for (const intermediate of values) {
            if (isBonus(intermediate)) {
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

        return {
            ...state,
            view,
            dynamicColumns,
            columns,
            isStartList: view.inter == null || view.inter.key === 0
        };
    });

    public readonly setMode = this.updater((state, mode: 'normal' | 'analysis') => ({
        ...state,
        view: {
            ...state.view,
            mode
        },
        columns: this.resetColumns(mode)
    }));

    public readonly setDisplayMode = this.updater((state, display: 'total' | 'diff') => ({
        ...state,
        view: {
            ...state.view,
            display
        }
    }));

    public readonly setZero = this.updater((state, bib: number) => ({
        ...state,
        view: {
            ...state.view,
            zero: bib
        }
    }));

    public readonly setTicker = this.updater((state, checked: boolean) => ({
        ...state,
        tickerEnabled: checked
    }));

    public readonly setUsePercent = this.updater((state, checked: boolean) => ({
        ...state,
        view: {
            ...state.view,
            usePercent: checked
        }
    }));

    public readonly setNameFormat = this.updater((state, format: string) => ({
        ...state,
        nameFormat: format
    }));

    public readonly toggleColumn = this.updater((state, columnId: string) => {
        const colIdx = state.columns.findIndex((column) => column.id === columnId);
        const columns = state.columns.slice();
        if (colIdx > -1) {
            columns[colIdx] = {
                ...columns[colIdx],
                toggled: !columns[colIdx].toggled
            };

            return {
                ...state,
                columns: columns
            };
        }

        return state;
    });

    public readonly reorderColumn = this.updater((state, event: CdkDragDrop<string[]>) => {
        if (event.previousIndex === event.currentIndex) {
            return state;
        }

        const array = state.columns.slice();
        moveItemInArray(array, event.previousIndex, event.currentIndex);

        return {
            ...state,
            columns: array
        };
    });

    public readonly setBreakpoint = this.updater((state, breakpoint: string) => {
        if (breakpoint === state.breakpoint) { return state; }

        if (state.view.mode === 'normal') {
            let columns;
            let format = state.nameFormat;
            if (breakpoint === 'large') {
                columns = [...defaultColumns];
            } else if (breakpoint === 'small') {
                columns = [...defaultColumnsSmall];
            } else {
                columns = [...defaultColumnsMini];
                format = 'i. l';
            }

            return {
                ...state,
                columns,
                breakpoint,
                nameFormat: format
            };
        } else {
            return {
                ...state,
                breakpoint
            };
        }
    });

    public readonly view$ = this.select((state) => state.view);

    public readonly columns$ = this.select((state) => state.columns);

    public readonly dynamicColumns$ = this.select((state) => state.dynamicColumns);

    public readonly displayedColumns$ = this.select(this.columns$, (columns) => {
        return columns.reduce((cols, col) => {
            if (col.toggled) {
                cols.push(col.id);
            }

            return cols;
        }, [] as string[]);
    });

    private readonly options$ = this.select(this._source, this.view$, (options, view) => {
        const inter: Option<Intermediate>[] = [];
        const diff: Option<Intermediate>[] = [];

        options.forEach((option) => {
            const curr = view.inter;
            inter.push({ value: option, selected: curr === option, disabled: false });

            if (!isBonus(option)) {
                const currDiff = view.diff;
                const disabled = isBonus(curr) || curr == null || (option.key !== 0 && option.key >= curr.key);
                const selected = currDiff === option;

                diff.push({value: option, selected, disabled});
            }
        });

        return { diff, inter };
    });

    getOptions() {
        return this.options$;
    }

    getRenderSelectionChanged() {
        return this.view$;
    }

    updateSelection(value: Intermediate, key: 'inter' | 'diff'): void {
        this.setState((state) => {
            const view = {...state.view};
            if (view[key] && view[key] === value) {
                return state;
            }

            view[key] = value;
            if (key === 'inter' && (value === null || isBonus(value) || (view.diff != null && value.key <= view.diff.key))) {
                view.diff = null;
            }

            return {
                ...state,
                view,
                isStartList: view.inter == null || view.inter.key === 0
            };
        });
    }
}

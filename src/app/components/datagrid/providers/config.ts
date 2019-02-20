import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Intermediate } from '../../../models/intermediate';
import { AppState, selectAllIntermediates } from '../../../state/reducers';
import { Option, OptionSelector } from '../../select/option-selector';

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
}

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
    breakpoint: 'large'
};

@Injectable()
export class DatagridConfig implements OptionSelector<View, Intermediate>, OnDestroy {
    private _internalConfig: Config = defaultConfig;
    private _config: BehaviorSubject<Config> = new BehaviorSubject(defaultConfig);
    private _subscription: Subscription;
    private _valueChanged = new BehaviorSubject<View>(this._internalConfig.view);
    private _renderSelectionChanged = new BehaviorSubject<View>(this._internalConfig.view);
    private _source: Observable<Intermediate[]>;
    private _dynamicColumns: string[] = [];


    constructor(private store: Store<AppState>) {
        this._source = store.pipe(
            select(selectAllIntermediates)
        );

        this._subscription = this._source.subscribe((values) => {
            const view = {...this._internalConfig.view};
            this._dynamicColumns = values.map((inter) => 'inter' + inter.key);

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
                    view
                };
                this._config.next(this._internalConfig);
                this._renderSelectionChanged.next(view);
            } else {
                this._internalConfig = {
                    ...this._internalConfig,
                    displayedColumns: ['order', 'bib', 'name'].concat(this._dynamicColumns.slice(1))
                };

                this._config.next(this._internalConfig);
            }
        });
    }

    public setMode(mode: 'normal' | 'analysis') {
        const displayedColumns = mode === 'normal' ? defaultConfig.displayedColumns :
            ['order', 'bib', 'name'].concat(this._dynamicColumns.slice(1));

        this._internalConfig = {
            ...this._internalConfig,
            view: {
                ...this._internalConfig.view,
                mode
            },
            displayedColumns
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

    public toggleColumn(column: string) {
    }

    public setBreakpoint(breakpoint: string) {
        if (this._internalConfig.view.mode === 'normal') {
            let columns = [];
            if (breakpoint === 'large') {
                columns = defaultConfig.displayedColumns;
            } else if (breakpoint === 'small') {
                columns = ['rank', 'bib', 'name', 'time', 'diff'];
            } else {
                columns = ['rank', 'name', 'time'];
            }

            this._internalConfig = {
                ...this._internalConfig,
                displayedColumns: columns,
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

    getOptions(key: keyof View): Observable<Option<Intermediate>[]> {
        return this._source.pipe(
            map((options) => options.map((option) => {
                    const inter = this._internalConfig.view.inter;
                    const curr = this._internalConfig.view[key];
                    const disabled = (key === 'diff') ? inter === null || (option.key !== 0 && option.key >= inter.key) : false;
                    const selected = curr === option;

                    return { value: option, selected, disabled };
                })
            )
        );
    }

    getRenderSelectionChanged(key: keyof View): Observable<Intermediate | null> {
        return this._renderSelectionChanged.asObservable().pipe(
            map(view => key === 'diff' || key === 'inter' ? view[key] : null)
        );
    }

    getValueChanged(): Observable<View> {
        return this._valueChanged.asObservable();
    }

    setSelected(value: View): void {
        // this.currentValue = value;
        // this._renderSelectionChanged.next(this.currentValue);
    }

    updateSelection(value: Intermediate, key: keyof View): void {
        const view = {...this._internalConfig.view};
        if (view[key] && view[key] === value) {
            return;
        }

        view[key] = value;
        if (key === 'inter' && (value === null || (view.diff != null && value.key <= view.diff.key))) {
            view.diff = null;
        }

        this._internalConfig = {
            ...this._internalConfig,
            view
        };
        this._config.next(this._internalConfig);
        this._renderSelectionChanged.next(view);
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}

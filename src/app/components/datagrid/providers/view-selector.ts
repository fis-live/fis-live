import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Intermediate } from '../../../models/intermediate';
import { AppState, selectAllIntermediates } from '../../../state/reducers';
import { Option, OptionSelector } from '../../select/option-selector';

export interface View {
    diff: Intermediate | null;
    inter: Intermediate | null;
}

@Injectable()
export class ViewSelector implements OptionSelector<View, Intermediate>, OnDestroy {
    private currentValue: View = {
        inter: null,
        diff: null
    };

    private _valueChanged = new BehaviorSubject<View>(this.currentValue);
    private _renderSelectionChanged = new BehaviorSubject<View>({
        inter: null,
        diff: null
    });
    private _source: Observable<Intermediate[]>;
    private _subscription: Subscription;

    constructor(private store: Store<AppState>) {
        this._source = store.pipe(
            select(selectAllIntermediates)
        );

        this._subscription = this._source.subscribe((values) => {
            if (values.length > 0 && this.currentValue.inter !== null) {
                if (this.currentValue.inter.key >= values.length) {
                    this.currentValue.inter = values[0];
                    this.currentValue.diff = null;
                    this._valueChanged.next(this.currentValue);
                    this._renderSelectionChanged.next(this.currentValue);
                } else {
                    this.currentValue.inter = values[this.currentValue.inter.key];
                    this.currentValue.diff = this.currentValue.diff !== null ? values[this.currentValue.diff.key] : null;
                    this._valueChanged.next(this.currentValue);
                    this._renderSelectionChanged.next(this.currentValue);
                }
            } else if (values.length > 0) {
                this.currentValue.inter = values[0];
                this.currentValue.diff = null;
                this._valueChanged.next(this.currentValue);
                this._renderSelectionChanged.next(this.currentValue);
            }
        });
    }

    getOptions(key: keyof View): Observable<Option<Intermediate>[]> {
        return this._source.pipe(
            map((options) => options.map((option) => {
                    const inter = this.currentValue.inter;
                    const curr = this.currentValue[key];
                    const disabled = (key === 'diff') ? inter === null || (option.key !== 0 && option.key >= inter.key) : false;
                    const selected = curr !== null && curr.id === option.id;
                    return { value: option, selected, disabled };
                })
            )
        );
    }

    getRenderSelectionChanged(key: keyof View): Observable<Intermediate | null> {
        return this._renderSelectionChanged.asObservable().pipe(
            map(view => view[key])
        );
    }

    getValueChanged(): Observable<View> {
        return this._valueChanged.asObservable();
    }

    setSelected(value: View): void {
        this.currentValue = value;
        this._renderSelectionChanged.next(this.currentValue);
    }

    updateSelection(value: Intermediate, key: keyof View): void {
        if (this.currentValue[key] && this.currentValue[key] === value) {
            return;
        }

        this.currentValue[key] = value;
        if (key === 'inter' && (value === null || (this.currentValue.diff != null && value.key <= this.currentValue.diff.key))) {
            this.currentValue.diff = null;
        }

        this._valueChanged.next(this.currentValue);
        this._renderSelectionChanged.next(this.currentValue);
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}

import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Intermediate } from '../../../models/intermediate';
import { AppState, selectAllIntermediates } from '../../../state/reducers';
import { Option, OptionSelector } from '../../select/option-selector';

export interface View {
    diff: Intermediate | null;
    inter: Intermediate | null;
}

@Injectable()
export class ViewSelector implements OptionSelector<View, Intermediate> {
    private currentValue: View = {
        inter: null,
        diff: null
    };

    private _valueChanged = new Subject<View>();
    private _renderSelectionChanged = new BehaviorSubject<View>({
        inter: null,
        diff: null
    });
    private _source: Observable<Intermediate[]>;

    constructor(private store: Store<AppState>) {
        this._source = store.pipe(
            select(selectAllIntermediates)
        );
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
}

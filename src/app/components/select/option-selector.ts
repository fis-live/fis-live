import { Observable } from 'rxjs';

export interface Option<T> {
    value: T;
    selected: boolean;
    disabled: boolean;
}

export interface OptionSelector<T, V> {
    getValueChanged(): Observable<T>;
    getRenderSelectionChanged(key: keyof T): Observable<V | null>;
    setSelected(value: T): void;
    updateSelection(value: V, key: keyof T): void;
    getOptions(key: keyof T): Observable<Option<V>[]>;
}

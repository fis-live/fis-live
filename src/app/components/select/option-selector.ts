import { Observable } from 'rxjs';

export interface Option<T> {
    value: T;
    selected: boolean;
    disabled: boolean;
}

export type KeysOfType<T, U> = { [k in keyof T]: T[k] extends U ? k : never }[keyof T];

export interface OptionSelector<T, V> {
    getValueChanged(): Observable<T>;
    getRenderSelectionChanged(key: KeysOfType<T, V | null>): Observable<V | null>;
    setSelected(value: T): void;
    updateSelection(value: V, key: KeysOfType<T, V | null>): void;
    getOptions(key: KeysOfType<T, V | null>): Observable<Option<V>[]>;
}

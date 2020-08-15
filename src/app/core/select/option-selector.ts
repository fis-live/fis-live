import { Observable } from 'rxjs';

export interface Option<T> {
    value: T;
    selected: boolean;
    disabled: boolean;
}

export type KeysOfType<T, U> = { [k in keyof T]: T[k] extends U | null ? k : never }[keyof T];

export interface OptionSelector<T, V> {
    getRenderSelectionChanged(): Observable<{ [P in KeysOfType<T, V>]: V | null }>;
    updateSelection(value: V, key: KeysOfType<T, V>): void;
    getOptions(): Observable<{ [P in KeysOfType<T, V>]: Option<V>[] }>;
}

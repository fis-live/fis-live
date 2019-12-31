import { Racer } from './racer';

export interface Prop<T> {
    value: T;
    display: T | string;
}

export interface Column {
    id: string;
    name: string;
    toggled: boolean;
    isDynamic: boolean;
}

export interface ColumnDef {
    id: string;
    name: string;
    sortBy: string;
    key: number;
}

export interface ResultItem {
    racer: Racer;
    time: Prop<number> | Prop<string>;
    diff: Prop<number>;
    tourStanding: Prop<number>;
    version: number;
    rank: number | null;
    state: string;
    notes: string[];
    classes: string[];
    marks: ((Prop<number> | Prop<string>) & { state: string })[];
}

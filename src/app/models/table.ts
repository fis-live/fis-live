export interface Prop<T> {
    value: T;
    display: T | string;
}

export interface Columns {
    bib: boolean;
    nationality: boolean;
    diff: boolean;
}

export interface ColumnDef {
    id: string;
    name: string;
    sortBy: string;
    key: number;
}

export interface ResultItem {
    id: number;
    bib: number;
    nsa: string;
    time: Prop<number> | Prop<string>;
    diff: Prop<number>;
    rank: number | null;
    state: string;
    name: Prop<string>;
    notes: string[];
    classes: string[];
    marks: (Prop<number> | Prop<string>)[];
}

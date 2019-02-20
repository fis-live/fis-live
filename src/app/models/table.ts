import { Prop } from './racer';

export interface Columns {
    bib: boolean;
    nationality: boolean;
    diff: boolean;
}

export interface ResultItem {
    id: number;
    bib: number;
    nationality: string;
    time: Prop<number> | Prop<string>;
    diff: Prop<number>;
    rank: number | null;
    state: string;
    name: Prop<string>;
    notes: string[];
    classes: string[];
    marks: (Prop<number> | Prop<string>)[];
}

export interface TableConfiguration {
    isStartList: boolean;
    rows: ResultItem[];
}

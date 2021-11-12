import { Intermediate, Racer } from '../../fis/cross-country/models';

export interface View {
    mode: 'normal' | 'analysis';
    inter: Intermediate | null;
    diff: Intermediate | null;
    zero: number;
    display: 'total' | 'diff';
    usePercent: boolean;
}

export interface Prop<T> {
    value: T;
    display: T | string;
    leader: boolean;
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

export interface DatagridState {
    view: View;
    isStartList: boolean;
    breakpoint: string;
    nameFormat: string;
    dynamicColumns: ColumnDef[];
    columns: Column[];
    tickerEnabled: boolean;
}

export interface Racer {
    id: number;
    bib: number;
    lastName: string;
    firstName: string;
    nationality: string;
    color: string;
    isFavorite: boolean;
}

export interface Prop<T> {
    value: T;
    display: T | string;
}

export interface Standing {
    version: number;
    ids: number[];
    leader: number;
    bestDiff: number[];
}

export interface Result {
    time: number;
    status: string;
    rank: number | null;
    diffs: number[];
}

export interface RacerData {
    id: number;
    racer: Racer;
    status: string;
    results: Result[];
    notes: string[];
}

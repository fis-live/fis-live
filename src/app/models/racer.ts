export interface Racer {
    id: number;
    bib: number;
    lastName: string;
    firstName: string;
    nationality: string;
    color: string;
    isFavorite: boolean;
}

export interface Result {
    time: number;
    rank: number | null;
    diffs: number[];
}

export interface RacerAndTime {
    time: number;
    racer: number;
}

export interface RacerData {
    id: number;
    racer: Racer;
    status: string;
    results: Result[];
    notes: string[];
}

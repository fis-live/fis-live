export interface Racer {
    id: number;
    bib: number;
    lastName: string;
    firstName: string;
    nsa: string;
    color: string;
    isFavorite: boolean;
}

export interface Standing {
    version: number;
    ids: number[];
    leader: number;
    bestDiff: number[];
}

export interface Mark {
    time: number;
    status: string;
    rank: number | null;
    diffs: number[];
}

export interface RacerData {
    id: number;
    racer: Racer;
    status: string;
    marks: Mark[];
    notes: string[];
}

export interface Event {
    racer: string;
    diff: string;
    rank: number;
    inter: string;
    status: string;
    timestamp: number;
    interId: number;
}

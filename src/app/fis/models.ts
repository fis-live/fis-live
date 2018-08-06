export interface Result {
    status: string;
    intermediate: number;
    racer: number;
    time: number;
}

export interface Status {
    id: number;
    status: string;
}

export interface StartListEntry {
    racer: number;
    order: number;
    status: string;
}

export interface Note {
    racer: number;
    note: string;
}


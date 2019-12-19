import { Status } from '../fis/fis-constants';

export interface Racer {
    id: number;
    bib: number;
    lastName: string;
    firstName: string;
    nsa: string;
    color: string;
    isFavorite: boolean;
    hasYellowCard: boolean;
    display: string;
    short: string;
    value: string;
}

export interface Standing {
    version: number;
    ids: number[];
    leader: number;
    bestDiff: number[];
    latestBibs: number[];
}

export interface Mark {
    time: number;
    status: Status;
    rank: number | null;
    diffs: number[];
    version: number;
}

export enum Note {
    Qualified,
    NotQualified,
    LuckyLoser,
    WaveStart,
    PhotoFinish,
    YellowCard
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

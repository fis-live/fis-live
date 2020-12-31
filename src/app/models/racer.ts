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
    sector: 'cc' | 'nk';
}

export interface Standing {
    version: number;
    ids: number[];
    leader: number;
    bestDiff: number[];
    tourLeader: number;
    latestBibs: number[];
    events: Event[];
}

export interface Mark {
    time: number;
    status: Status;
    rank: number | null;
    diffs: number[];
    version: number;
    tourStanding: number;
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
    bonusSeconds: number;
}

export interface Event {
    racer: Racer;
    diff: string;
    rank: number | null;
    timestamp: number;
}

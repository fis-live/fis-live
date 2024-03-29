import { Status } from '../fis-constants';

export interface Intermediate {
    type: 'start_list' | 'inter' | 'finish' | 'bonus_points' | 'bonus_time' | 'standing';
    key: number;
    distance: number;
    name: string;
    id: number;
    short: string;
}

export interface RaceInfo {
    eventName: string;
    raceName: string;
    slopeName: string;
    discipline: string;
    gender: string;
    category: string;
    place: string;
    temperatureUnit: string;
    lengthUnit: string;
    speedUnit: string;
    team: string;
    tds: string;
}

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
    timestamp?: number;
}

export interface RacerData {
    id: number;
    racer: Racer;
    status: string;
    order: number | null;
    startTime: string | null;
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

export interface PdfData {
    bib: number;
    pursuitTime?: number;
    isWave: boolean | null;
    tourStanding?: number;
}

export interface State {
    id: string;
    ids: number[];
    entities: { [id: number]: RacerData };
    intermediates: Intermediate[];
    interById: { [id: number]: number };
    standings: { [id: number]: Standing };
    precision: number;
    isSprintFinals?: boolean;
    runs: Run[];
    activeRun: number;
    activeHeat: number | null;
}

export interface Heat {
    ids: number[];
    heatNo: number;
    leader: number;
    version: number;
    name: string;
}

export interface Run {
    runNo: number;
    currentLucky: number[];
    heats: Heat[];
}

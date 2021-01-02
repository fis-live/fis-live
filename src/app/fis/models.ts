import { Status as StatusEnum } from './fis-constants';

export interface Result {
    status: StatusEnum;
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
    notes: string[];
}

export interface Note {
    bib: number;
    note: string;
}

export interface Main {
    racedef: [string, number, number][];
    raceinfo: string[];
    message: string;
    meteo: [number, string, string, number, number, string];
    main: number;
    live: [number, number, string];
    racers: (null | [number, number, string, string, string, string, string, string, number])[];
    startlist: [number, string, number, string, number][];
    result: (null | number[])[];
    runinfo: [number, string, string];
}

export interface Update {
    live: [number, number, string];
    events: any[][];
}

export interface PdfData {
    bib: number;
    time: number | null;
    isWave: boolean | null;
    shirt: string | null;
    tourStanding: string | null;
}

export interface ServerList {
    servers: [string, number, number][];
}

export interface FisEvent {
    type: string;
    payload: Result | Status | Note | number;
}

export interface FisServer {
    url: string;
    weight: number;
    index: number;
}

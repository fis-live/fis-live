import { EventArray } from './event-types';
import { Status as StatusEnum } from './fis-constants';
import { Live, MeteoArray, RaceDef, RaceInfoArray, RacerArray, RunInfo, RunNo, StartList, TabRunsPrec } from './types';

export interface Result {
    status: StatusEnum;
    intermediate: number;
    racer: number;
    time: number;
    run: number;
}

export interface Status {
    id: number;
    run: number;
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
    run: number;
}

export interface Main {
    racedef: RaceDef[];
    raceinfo: RaceInfoArray;
    message: string | null;
    meteo: MeteoArray;
    main: number;
    live: Live;
    racers: (RacerArray | null)[];
    startlist: (StartList | null)[];
    result: ((number | null)[] | null)[];
    runinfo: RunInfo;
    runno: RunNo;
    chrono: [string, string];
    tabrunsprec?: (TabRunsPrec | null)[][];
}

export interface Update {
    live: Live;
    events: EventArray[];
    runno: RunNo;
    reload?: number;
}

export interface PdfData {
    bib: number;
    time: number | null;
    isWave: boolean | null;
    shirt: string | null;
    tourStanding: string | null;
}

export interface ServerList {
    servers: [url: string, weight: number, index: number][];
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

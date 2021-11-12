import { Meteo } from '../shared';

import { Live, RunInfo, RunNo, TabRunsPrec } from './api/types';
import { Intermediate, RaceInfo, Racer } from './models';

export interface StartListEntry {
    bib: number;
    note: string | null;
    order: number;
    status: string | null;
    startTime: string | null;
    heats: number | null | undefined;
}

export interface Main {
    intermediates: Intermediate[];
    raceInfo: RaceInfo;
    message: string;
    meteo: Meteo;
    main: number;
    live: Live;
    racers: Racer[];
    startList: { [bib: number]: StartListEntry };
    results: ((number | null)[] | null)[];
    runInfo: RunInfo;
    runNo: RunNo;
    tabrunsprec?: (TabRunsPrec | null)[][];
    resultKeys: number[];
}

export interface Update {
    live: Live;
    events: (ResultEvent | NoteEvent | RunEvent | MessageEvent | MeteoEvent)[];
    runNo: RunNo;
    reload: boolean;
}

export interface ResultEvent {
    type: 'inter' | 'finish' | 'standing' | 'bonuspoint' | 'bonustime';
    run: number;
    bib: number;
    inter: number;
    time: number;
    precision: number;
}

export interface NoteEvent {
    type: 'q' | 'nq' | 'sanction' | 'start' | 'nextstart' | 'currentlucky' | 'ff' | 'lucky' | 'dnf' | 'dns' | 'dq' | 'dsq' | 'ral' | 'nps' | 'lapped';
    run: number;
    bib: number;
}

export interface RunEvent {
    type: 'activerun' | 'activeheat' | 'startlist' | 'rundef';
    run: number;
}

export interface MessageEvent {
    type: 'message';
    message: string;
}

export interface MeteoEvent {
    type: 'meteo';
    meteo: Meteo;
}

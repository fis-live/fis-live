import { MeteoArray } from './types';

export type ResultEventArray = [
    type: 'inter' | 'finish' | 'standing' | 'bonuspoint' | 'bonustime',
    run: number,
    bib: number,
    inter: number,
    time: number,
    formatted: string | number | null,
    rank: number | null,
    finalPosition: number,
    _unknown: string | null,
    precision: number
];

export type NoteEventArray = [
    type: 'q' | 'nq' | 'sanction' | 'start' | 'nextstart' | 'currentlucky' | 'ff' | 'lucky' | 'dnf' | 'dns' | 'dq' | 'dsq' | 'ral' | 'nps' | 'lapped',
    run: number,
    bib: number
];

export type RunEventArray = [
    type: 'activerun' | 'activeheat' | 'startlist' | 'rundef',
    run: number
];

export type NotificationEventArray = [
    type: 'reloadmain' | 'reloadflash' | 'tobeat' | 'unofficial_result' | 'official_result' | 'inprogress',
    other: ''
];

export type MessageEventArray = [
    type: 'message',
    message: string | null
];

export type MeteoEventArray = [
    type: 'meteo',
    ...meteo: MeteoArray
];

export type EventArray = ResultEventArray | NoteEventArray | RunEventArray | NotificationEventArray | MessageEventArray | MeteoEventArray;

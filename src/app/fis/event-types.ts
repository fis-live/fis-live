import { Meteo } from './types';

export type InterEvent = [
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

export type NoteEvent = [
    type: 'q' | 'nq' | 'sanction' | 'start' | 'nextstart' | 'currentlucky' | 'ff' | 'lucky' | 'dnf' | 'dns' | 'dq' | 'dsq' | 'ral' | 'nps' | 'lapped',
    run: number,
    bib: number
];

export type RunEvent = [
    type: 'activerun' | 'activeheat' | 'startlist' | 'rundef',
    run: number
];

export type NotificationEvent = [
    type: 'reloadmain' | 'reloadflash' | 'tobeat' | 'unofficial_result' | 'official_result' | 'inprogress',
    other: ''
];

export type MessageEvent = [
    type: 'message',
    message: string | null
];

export type MeteoEvent = [
    type: 'meteo',
    ...meteo: Meteo
];

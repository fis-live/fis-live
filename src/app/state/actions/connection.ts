import { Action } from '@ngrx/store';

import { Race } from '../../models/race';

export const LOAD_SERVERS = '[Connection] Load servers';
export const SELECT_SERVER = '[Connection] Select server';
export const SHOW_ALERT = '[Alert] Show alert';
export const LOAD_MAIN = '[Connection] Load main';
export const LOAD_PDF = '[Connection] Load pdf';
export const LOAD_UPDATE = '[Connection] Load update';
export const LOAD_CALENDAR = '[Connection] Load calendar';
export const SET_CALENDAR = '[Connection] Set calendar';
export const STOP_UPDATE = '[Connection] Stop updating';
export const RESET = '[Connection] Reset state';
export const CLOSE_ALERT = '[Alert] Close alert';
export const SHOW_LOADING = '[Loading] Show loading indicator';
export const HIDE_LOADING = '[Loading] Hide loading indicator';
export const BATCH = '[Connection] Batch action';


export class LoadServer implements Action {
    readonly type = LOAD_SERVERS;

    constructor() { }
}

export class SelectServer implements Action {
    readonly type = SELECT_SERVER;

    constructor() { }
}

export class ShowAlert implements Action {
    readonly type = SHOW_ALERT;

    constructor(public payload: any) { }
}

export class Reset implements Action {
    readonly type = RESET;

    constructor() { }
}

export class LoadMain implements Action {
    readonly type = LOAD_MAIN;

    constructor(public payload: number) { }
}

export class LoadPdf implements Action {
    readonly type = LOAD_PDF;

    constructor(public payload: string) { }
}

export class LoadUpdate implements Action {
    readonly type = LOAD_UPDATE;

    constructor() { }
}

export class LoadCalendar implements Action {
    readonly type = LOAD_CALENDAR;

    constructor() { }
}

export class SetCalendar implements Action {
    readonly type = SET_CALENDAR;

    constructor(public payload: Race[]) { }
}

export class StopUpdate implements Action {
    readonly type = STOP_UPDATE;

    constructor() { }
}

export class CloseAlert implements Action {
    readonly type = CLOSE_ALERT;

    constructor() { }
}

export class ShowLoading implements Action {
    readonly type = SHOW_LOADING;

    constructor() { }
}

export class HideLoading implements Action {
    readonly type = HIDE_LOADING;

    constructor() { }
}

export class Batch implements Action {
    readonly type = BATCH;

    constructor(public payload: Action[]) { }
}

export type ConnectionAction
    = LoadServer
    | SelectServer
    | ShowAlert
    | Reset
    | LoadMain
    | LoadPdf
    | LoadUpdate
    | LoadCalendar
    | SetCalendar
    | StopUpdate
    | CloseAlert
    | ShowLoading
    | HideLoading
    | Batch;

import { Action } from '@ngrx/store';

import { Alert } from '../../models/alert';
import { Race } from '../../models/race';

export const enum ConnectionActionTypes {
    LoadServers = '[Connection] Load servers',
    SelectServer = '[Connection] Select server',
    ShowAlert = '[Alert] Show alert',
    LoadMain = '[Connection] Load main',
    LoadPdf = '[Connection] Load pdf',
    LoadUpdate = '[Connection] Load update',
    LoadCalendar = '[Connection] Load calendar',
    SetCalendar = '[Connection] Set calendar',
    StopUpdate = '[Connection] Stop updating',
    Reset = '[Connection] Reset state',
    CloseAlert = '[Alert] Close alert',
    Batch = '[Connection] Batch action'
}

export class LoadServers implements Action {
    readonly type = ConnectionActionTypes.LoadServers;

    constructor() { }
}

export class SelectServer implements Action {
    readonly type = ConnectionActionTypes.SelectServer;

    constructor() { }
}

export class ShowAlert implements Action {
    readonly type = ConnectionActionTypes.ShowAlert;

    constructor(public payload: Alert) { }
}

export class Reset implements Action {
    readonly type = ConnectionActionTypes.Reset;

    constructor() { }
}

export class LoadMain implements Action {
    readonly type = ConnectionActionTypes.LoadMain;

    constructor(public payload: number | null) { }
}

export class LoadPdf implements Action {
    readonly type = ConnectionActionTypes.LoadPdf;

    constructor(public payload: string) { }
}

export class LoadUpdate implements Action {
    readonly type = ConnectionActionTypes.LoadUpdate;

    constructor() { }
}

export class LoadCalendar implements Action {
    readonly type = ConnectionActionTypes.LoadCalendar;

    constructor() { }
}

export class SetCalendar implements Action {
    readonly type = ConnectionActionTypes.SetCalendar;

    constructor(public payload: Race[]) { }
}

export class StopUpdate implements Action {
    readonly type = ConnectionActionTypes.StopUpdate;

    constructor() { }
}

export class CloseAlert implements Action {
    readonly type = ConnectionActionTypes.CloseAlert;

    constructor() { }
}

export class Batch implements Action {
    readonly type = ConnectionActionTypes.Batch;

    constructor(public payload: Action[]) { }
}

export type ConnectionAction
    = LoadServers
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
    | Batch;

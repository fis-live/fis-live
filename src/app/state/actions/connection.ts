import { Action } from '@ngrx/store';

export const ConnectionActions = {
    LOAD_SERVERS: '[Connection] Load servers',
    SELECT_SERVER: '[Connection] Select server',
    SHOW_ALERT: '[Alert] Show alert',
    LOAD_MAIN: '[Connection] Load main',
    LOAD_PDF: '[Connection] Load pdf',
    LOAD_UPDATE: '[Connection] Load update',
    STOP_UPDATE: '[Connection] Stop updating',
    RESET: '[Connection] Reset state',
    CLOSE_ALERT: '[Alert] Close alert',
    SHOW_LOADING: '[Loading] Show loading indicator',
    HIDE_LOADING: '[Loading] Hide loading indicator'
};


export class LoadServerAction implements Action {
    type = ConnectionActions.LOAD_SERVERS;

    constructor() { }
}

export class SelectServerAction implements Action {
    type = ConnectionActions.SELECT_SERVER;

    constructor() { }
}

export class ShowAlertAction implements Action {
    type = ConnectionActions.SHOW_ALERT;

    constructor(public payload: any) { }
}

export class ResetAction implements Action {
    type = ConnectionActions.RESET;

    constructor() { }
}

export class LoadMainAction implements Action {
    type = ConnectionActions.LOAD_MAIN;

    constructor(public payload: number) { }
}

export class LoadPdfAction implements Action {
    type = ConnectionActions.LOAD_PDF;

    constructor(public payload: string) { }
}

export class LoadUpdateAction implements Action {
    type = ConnectionActions.LOAD_UPDATE;

    constructor() { }
}

export class StopUpdateAction implements Action {
    type = ConnectionActions.STOP_UPDATE;

    constructor() { }
}

export class CloseAlertAction implements Action {
    type = ConnectionActions.CLOSE_ALERT;

    constructor() { }
}

export class ShowLoadingAction implements Action {
    type = ConnectionActions.SHOW_LOADING;

    constructor() { }
}

export class HideLoadingAction implements Action {
    type = ConnectionActions.HIDE_LOADING;

    constructor() { }
}

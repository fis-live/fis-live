import { Action } from '@ngrx/store';

export const ConnectionActions = {
    LOAD_SERVERS: '[Connection] Load servers',
    LOAD_SERVERS_SUCCESS: '[Connection] Servers loaded succesfully',
    LOAD_SERVERS_ERROR: '[Connection] Error on loading servers',
    LOAD_MAIN: '[Connection] Load main',
    LOAD_UPDATE: '[Connection] Load update',
    STOP_UPDATE: '[Connection] Stop updating'
};


export class LoadServerAction implements Action {
    type = ConnectionActions.LOAD_SERVERS;

    constructor() { }
}

export class LoadServerSuccessAction implements Action {
    type = ConnectionActions.LOAD_SERVERS_SUCCESS;

    constructor() { }
}

export class LoadServerErrorAction implements Action {
    type = ConnectionActions.LOAD_SERVERS_ERROR;

    constructor() { }
}

export class LoadMainAction implements Action {
    type = ConnectionActions.LOAD_MAIN;

    constructor(public payload: number) { }
}

export class LoadUpdateAction implements Action {
    type = ConnectionActions.LOAD_UPDATE;

    constructor() { }
}

export class StopUpdateAction implements Action {
    type = ConnectionActions.STOP_UPDATE;

    constructor() { }
}
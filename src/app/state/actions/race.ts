import { Action } from '@ngrx/store';
import { Racer } from '../../models/racer';
import { Intermediate } from '../../models/intermediate';

export const REGISTER_RESULT = '[Result] Register result';
export const ADD_RACER = '[Racer] Add racer';
export const SET_STATUS = '[Racer] Set status';
export const UPDATE_RACE_INFO = '[Info] Update race info';
export const SET_RACE_MESSAGE = '[Info] Set message';
export const ADD_INTERMEDIATE = '[Intermediate] Add intermediate';
export const ADD_START_LIST = '[Start list] Add entry';
export const UPDATE_METEO = '[Info] Update meteo';
export const SET_START_TIME = '[Result] Register start time';
export const SET_BIB_COLOR = '[Racer] Set bib color';

export class RegisterResult implements Action {
    readonly type = REGISTER_RESULT;

    constructor(public payload: any) {
    }
}

export class AddRacer implements Action {
    readonly type = ADD_RACER;

    constructor(public payload: Racer) {
    }
}

export class SetStatus implements Action {
    readonly type = SET_STATUS;

    constructor(public payload: any) {
    }
}

export class SetBibColor implements Action {
    readonly type = SET_BIB_COLOR;

    constructor(public payload: any) {
    }
}

export class SetStartTime implements Action {
    readonly type = SET_START_TIME;

    constructor(public payload: any) {
    }
}

export class UpdateRaceInfo implements Action {
    readonly type = UPDATE_RACE_INFO;

    constructor(public payload: any) {
    }
}

export class SetRaceMessage implements Action {
    readonly type = SET_RACE_MESSAGE;

    constructor(public payload: any) {
    }
}

export class AddIntermediate implements Action {
    readonly type = ADD_INTERMEDIATE;

    constructor(public payload: Intermediate) {
    }
}

export class AddStartList implements Action {
    readonly type = ADD_START_LIST;

    constructor(public payload: any) {
    }
}

export class UpdateMeteo implements Action {
    readonly type = UPDATE_METEO;

    constructor(public payload: any) {
    }
}


export type RaceAction
    = RegisterResult
    | AddRacer
    | SetStatus
    | SetBibColor
    | SetStartTime
    | UpdateRaceInfo
    | SetRaceMessage
    | AddIntermediate
    | AddStartList
    | UpdateMeteo;

import { Action } from '@ngrx/store';

import { Intermediate } from '../../models/intermediate';
import { Racer } from '../../models/racer';

export const enum RaceActionTypes {
    RegisterResult = '[Result] Register result',
    AddRacer = '[Racer] Add racer',
    SetStatus = '[Racer] Set status',
    UpdateRaceInfo = '[Info] Update race info',
    SetRaceMessage = '[Info] Set message',
    AddIntermediate = '[Intermediate] Add intermediate',
    AddStartList = '[Start list] Add entry',
    UpdateMeteo = '[Info] Update meteo',
    SetStartTime = '[Result] Register start time',
    SetBibColor = '[Racer] Set bib color',
    AddNote = '[Racer] Set wave start'
}

export class RegisterResult implements Action {
    readonly type = RaceActionTypes.RegisterResult;

    constructor(public payload: any) { }
}

export class AddRacer implements Action {
    readonly type = RaceActionTypes.AddRacer;

    constructor(public payload: Racer) { }
}

export class SetStatus implements Action {
    readonly type = RaceActionTypes.SetStatus;

    constructor(public payload: any) { }
}

export class SetBibColor implements Action {
    readonly type = RaceActionTypes.SetBibColor;

    constructor(public payload: any) { }
}

export class SetStartTime implements Action {
    readonly type = RaceActionTypes.SetStartTime;

    constructor(public payload: any) { }
}

export class AddNote implements Action {
    readonly type = RaceActionTypes.AddNote;

    constructor(public payload: any) { }
}

export class UpdateRaceInfo implements Action {
    readonly type = RaceActionTypes.UpdateRaceInfo;

    constructor(public payload: any) { }
}

export class SetRaceMessage implements Action {
    readonly type = RaceActionTypes.SetRaceMessage;

    constructor(public payload: any) { }
}

export class AddIntermediate implements Action {
    readonly type = RaceActionTypes.AddIntermediate;

    constructor(public payload: Intermediate) { }
}

export class AddStartList implements Action {
    readonly type = RaceActionTypes.AddStartList;

    constructor(public payload: any) { }
}

export class UpdateMeteo implements Action {
    readonly type = RaceActionTypes.UpdateMeteo;

    constructor(public payload: any) { }
}


export type RaceAction
    = RegisterResult
    | AddRacer
    | SetStatus
    | SetBibColor
    | SetStartTime
    | AddNote
    | UpdateRaceInfo
    | SetRaceMessage
    | AddIntermediate
    | AddStartList
    | UpdateMeteo;

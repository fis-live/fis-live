import { Action } from '@ngrx/store';

import { Note, Result, StartListEntry, Status } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Racer } from '../../models/racer';

export const enum RaceActionTypes {
    RegisterResult = '[Result] Register result',
    AddRacer = '[Racer] Add racer',
    SetStatus = '[Racer] Set status',
    AddIntermediate = '[Intermediate] Add intermediate',
    AddStartList = '[Start list] Add entry',
    SetStartTime = '[Result] Register start time',
    SetBibColor = '[Racer] Set bib color',
    AddNote = '[Racer] Set wave start'
}

export class RegisterResult implements Action {
    readonly type = RaceActionTypes.RegisterResult;

    constructor(public payload: Result, public isEvent = false, public timestamp: number = Date.now()) { }
}

export class AddRacer implements Action {
    readonly type = RaceActionTypes.AddRacer;

    constructor(public payload: Racer) { }
}

export class SetStatus implements Action {
    readonly type = RaceActionTypes.SetStatus;

    constructor(public payload: Status) { }
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

    constructor(public payload: Note) { }
}

export class AddIntermediate implements Action {
    readonly type = RaceActionTypes.AddIntermediate;

    constructor(public payload: Intermediate) { }
}

export class AddStartList implements Action {
    readonly type = RaceActionTypes.AddStartList;

    constructor(public payload: StartListEntry) { }
}


export type RaceAction
    = RegisterResult
    | AddRacer
    | SetStatus
    | SetBibColor
    | SetStartTime
    | AddNote
    | AddIntermediate
    | AddStartList;

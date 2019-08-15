import { createAction, props } from '@ngrx/store';

import { Note, Result, StartListEntry, Status } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Racer } from '../../models/racer';

export const registerResult = createAction(
    '[Result] Register result',
    props<{result: Result, isEvent: boolean, timestamp: number}>()
);

// export class RegisterResult implements Action {
//     readonly type = RaceActionTypes.RegisterResult;
//
//     constructor(public payload: Result, public isEvent = false, public timestamp: number = Date.now()) { }
// }

export const addRacer = createAction(
    '[Racer] Add racer',
    props<{racer: Racer}>()
);

export const setStatus = createAction(
    '[Racer] Set status',
    props<{status: Status}>()
);

export const setBibColor = createAction(
    '[Racer] Set bib color',
    props<{color: any}>()
);

export const setStartTime = createAction(
    '[Result] Register start time',
    props<{time: any}>()
);

export const addNote = createAction(
    '[Racer] Set wave start',
    props<{note: Note}>()
);

export const addIntermediate = createAction(
    '[Intermediate] Add intermediate',
    props<{intermediate: Intermediate}>()
);

export const addStartList = createAction(
    '[Start list] Add entry',
    props<{entry: StartListEntry}>()
);

import { Action } from '@ngrx/store';
import { Racer } from '../../models/racer';

export const RaceActions = {
    REGISTER_RESULT: '[Result] Register result',
    ADD_RACER: '[Racer] Add racer',
    SET_STATUS: '[Racer] Set status',
    UPDATE_RACE_INFO: '[Info] Update race info',
    SET_RACE_MESSAGE: '[Info] Set message',
    ADD_INTERMEDIATE: '[Intermediate] Add intermediate',
    ADD_START_LIST: '[Start list] Add entry',
    UPDATE_METEO: '[Info] Update meteo'
};

export class RegisterResultAction implements Action {
    type = RaceActions.REGISTER_RESULT;

    constructor(public payload: any) {
    }
}

export class AddRacerAction implements Action {
    type = RaceActions.ADD_RACER;

    constructor(public payload: Racer) {
    }
}

export class SetStatusAction implements Action {
    type = RaceActions.SET_STATUS;

    constructor(public payload: any) {
    }
}

export class UpdateRaceInfoAction implements Action {
    type = RaceActions.UPDATE_RACE_INFO;

    constructor(public payload: any) {
    }
}

export class SetRaceMessageAction implements Action {
    type = RaceActions.SET_RACE_MESSAGE;

    constructor(public payload: any) {
    }
}

export class AddIntermediateAction implements Action {
    type = RaceActions.ADD_INTERMEDIATE;

    constructor(public payload: any) {
    }
}

export class AddStartListAction implements Action {
    type = RaceActions.ADD_START_LIST;

    constructor(public payload: any) {
    }
}

export class UpdateMeteoAction implements Action {
    type = RaceActions.UPDATE_METEO;

    constructor(public payload: any) {
    }
}

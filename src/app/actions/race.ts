import { Action } from '@ngrx/store';

import { Racer } from "../models/racer";

export class RaceActions {
    static REGISTER_RESULT = 'REGISTER_RESULT';
    static ADD_RACER = 'ADD_RACER';

    static UPDATE_RACE_INFO = '[Info] Update race info';
    static SET_RACE_MESSAGE= '[Info] Set message';

    static ADD_INTERMEDIATE = '[Intermediate] Add intermediate';

    static registerResultAction(payload: any): Action {
        return {type: RaceActions.REGISTER_RESULT, payload: payload};
    }

    static addRacerAction(payload: Racer): Action {
        return {type: RaceActions.ADD_RACER, payload: payload};
    }

    static updateRaceInfoAction(payload: any): Action {
        return {type: RaceActions.UPDATE_RACE_INFO, payload: payload};
    }

    static setRaceMessageAction(payload: any): Action {
        return {type: RaceActions.SET_RACE_MESSAGE, payload: payload};
    }

    static addIntermediateAction(payload: any): Action {
        return {type: RaceActions.ADD_INTERMEDIATE, payload: payload};
    }
}
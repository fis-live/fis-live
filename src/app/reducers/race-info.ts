import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

import { RaceActions} from "../actions";
import { Observable } from "rxjs/Observable";
import { RaceInfo } from "../models/race-info";

export interface State {
    info: RaceInfo;
    message: string;
}

const initialState: State = {
    info: {eventName: '', raceName: ''},
    message: ''
};


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case RaceActions.UPDATE_RACE_INFO:
            const info = action.payload;

            return {
                info: Object.assign({}, state.info, info),
                message: state.message
            };

        case RaceActions.SET_RACE_MESSAGE:
            const message: string = action.payload;

            return {
                info: state.info,
                message: message
            };


        default:
            return state;
    }
}

export function getRaceInfo(state$: Observable<State>) {
    return state$.select(state => state);
}
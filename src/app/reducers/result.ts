import { Action } from '@ngrx/store';

import { REGISTER_RESULT } from "../actions";

interface Item {
    racer: string;
    time: number;
    intermediate: number;
}

export interface State extends Array<Item>{ }

export function reducer(state: State = [], action: Action): State {
    switch (action.type) {
        case REGISTER_RESULT:
            return [ ...state, Object.assign({}, {racer: action.payload.racer, time: action.payload.time, intermediate: action.payload.intermediate})];


        default:
            return state;
    }
}
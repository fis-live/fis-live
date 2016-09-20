import { Action } from '@ngrx/store';

import { REGISTER_RESULT } from "../actions";

interface Item {
    name: string;
    time: number;
}

export interface State extends Array<Item>{ }

export function reducer(state: State = [], action: Action): State {
    switch (action.type) {
        case REGISTER_RESULT:
            return [ ...state, Object.assign({}, {name: action.payload.name, time: action.payload.time})];


        default:
            return state;
    }
}
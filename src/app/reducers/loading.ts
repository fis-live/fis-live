import { Action } from '@ngrx/store';

import { ConnectionActions } from "../actions";

export type State = boolean;

const initialState: State = false;


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case ConnectionActions.LOAD_SERVERS || ConnectionActions.LOAD_MAIN:
            return true;

        case 'CLOSE_ERROR':
            return initialState;


        default:
            return false;
    }
}
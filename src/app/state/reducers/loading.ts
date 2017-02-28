import { Action } from '@ngrx/store';

import { ConnectionActions } from '../actions';

export type State = boolean;

const initialState: State = false;

export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case ConnectionActions.SHOW_LOADING:
            return true;

        case ConnectionActions.HIDE_LOADING:
            return false;

        default:
            return state;
    }
}

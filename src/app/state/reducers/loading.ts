import * as ConnectionActions from '../actions/connection';

export type State = boolean;

const initialState: State = false;

export function reducer(state: State = initialState, action: ConnectionActions.ConnectionAction): State {
    switch (action.type) {
        case ConnectionActions.SHOW_LOADING:
            return true;

        case ConnectionActions.HIDE_LOADING:
            return false;

        default:
            return state;
    }
}

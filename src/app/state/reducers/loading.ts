import { ConnectionAction, ConnectionActionTypes } from '../actions/connection';

export type State = boolean;

const initialState: State = false;

export function reducer(state: State = initialState, action: ConnectionAction): State {
    switch (action.type) {
        case ConnectionActionTypes.ShowLoading:
            return true;

        case ConnectionActionTypes.HideLoading:
            return false;

        default:
            return state;
    }
}

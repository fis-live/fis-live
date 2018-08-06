import { LoadingAction, LoadingActionTypes } from '../actions/loading';

export type State = boolean;

const initialState: State = false;

export function reducer(state: State = initialState, action: LoadingAction): State {
    switch (action.type) {
        case LoadingActionTypes.ShowLoading:
            return true;

        case LoadingActionTypes.HideLoading:
            return false;

        default:
            return state;
    }
}

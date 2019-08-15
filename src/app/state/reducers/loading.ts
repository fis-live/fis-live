import { Action, createReducer, on } from '@ngrx/store';

import { LoadingActions } from '../actions';

export type State = boolean;

const initialState: State = false;

const loadingReducer = createReducer(
    initialState,
    on(LoadingActions.showLoading, () => true),
    on(LoadingActions.hideLoading, () => false)
);

export function reducer(state: State | undefined, action: Action) {
    return loadingReducer(state, action);
}

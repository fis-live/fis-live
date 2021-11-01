import { Action, createReducer, on } from '@ngrx/store';

import { ConnectionActions } from '../actions';

export interface Alert {
    message: string;
    severity: string;
    action: string;
    actions: Action[];
}

export type State = Alert | null;

const initialState = null as State;

const alertReducer = createReducer(
    initialState,
    on(ConnectionActions.showAlert, (_, { alert }) => alert),
    on(ConnectionActions.closeAlert, () => initialState)
);

export function reducer(state: State | undefined, action: Action) {
    return alertReducer(state, action);
}

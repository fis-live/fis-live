import { Action, createReducer, on } from '@ngrx/store';

import { Alert } from '../../models/alert';
import { ConnectionActions } from '../actions';

export type State = Alert | null;

const initialState = null as State;

const alertReducer = createReducer(
    initialState,
    on(ConnectionActions.showAlert, (_, { alert }) => alert),
    on(ConnectionActions.closeAlert, (_) => initialState)
);

export function reducer(state: State | undefined, action: Action) {
    return alertReducer(state, action);
}

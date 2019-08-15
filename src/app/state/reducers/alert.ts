import { Action, createReducer, on } from '@ngrx/store';

import { ConnectionActions } from '../actions';

export interface State {
    isOpen: boolean;
    message: string;
    severity: string;
    action: string;
    actions: Action[];
}

const initialState: State = {
    isOpen: false,
    message: '',
    severity: '',
    action: '',
    actions: []
};

const alertReducer = createReducer(
    initialState,
    on(ConnectionActions.showAlert, (_state, { alert }) => ({
        isOpen: true,
        message: alert.message || '',
        severity: alert.severity || '',
        action: alert.action || '',
        actions: alert.actions || []
    })),
    on(ConnectionActions.closeAlert, () => initialState)
);

export function reducer(state: State | undefined, action: Action) {
    return alertReducer(state, action);
}

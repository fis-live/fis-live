import { Action } from '@ngrx/store';

import { ConnectionAction, ConnectionActionTypes } from '../actions/connection';

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


export function reducer(state: State = initialState, action: ConnectionAction): State {
    switch (action.type) {
        case ConnectionActionTypes.ShowAlert:
            const alert = action.payload;

            return {
                isOpen: true,
                message: alert.message || '',
                severity: alert.severity || '',
                action: alert.action || '',
                actions: alert.actions || []
            };

        case ConnectionActionTypes.CloseAlert:
            return initialState;


        default:
            return state;
    }
}

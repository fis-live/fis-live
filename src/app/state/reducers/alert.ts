import { Action } from '@ngrx/store';

import * as ConnectionActions from '../actions/connection';

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


export function reducer(state: State = initialState, action: ConnectionActions.ConnectionAction): State {
    switch (action.type) {
        case ConnectionActions.SHOW_ALERT:
            const alert: any = action.payload;

            return {
                isOpen: true,
                message: alert.message || '',
                severity: alert.severity || '',
                action: alert.action || '',
                actions: alert.actions || []
            };

        case ConnectionActions.CLOSE_ALERT:
            return initialState;


        default:
            return state;
    }
}

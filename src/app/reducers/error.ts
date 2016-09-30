import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

import { ConnectionActions } from "../actions";

export interface State {
    error: boolean
    message: string;
    title: string;
}

const initialState: State = {
    error: false,
    message: '',
    title: ''
};


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case ConnectionActions.LOAD_SERVERS_ERROR:
            const error = action.payload;

            return {
                error: true,
                message: 'Could not connect to the FIS servers',
                title: 'Server error'
            };

        case 'CLOSE_ERROR':
            return initialState;


        default:
            return state;
    }
}
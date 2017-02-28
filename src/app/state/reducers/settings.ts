import { Action } from '@ngrx/store';

import { SettingsActions } from '../actions/';
import { Racer } from '../../models/racer';

export interface State {
    favoriteRacers: Racer[];
}

const initialState: State = {
    favoriteRacers: []
};


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case SettingsActions.TOGGLE_FAVORITE:
            const racer: Racer = action.payload;

            if (state.favoriteRacers.find((row) => row.id === racer.id) != null) {
                return {
                    favoriteRacers: state.favoriteRacers.reduce((arr, row) => (racer.id === row.id) ? arr : arr.concat(row), [])
                };
            }

            return {
                favoriteRacers: [ ...state.favoriteRacers, racer ]
            };


        default:
            return state;
    }
}

export const getFavoriteRacers = (state: State) => state.favoriteRacers;

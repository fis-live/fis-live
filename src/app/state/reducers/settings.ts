import { Racer } from '../../models/racer';
import * as SettingsActions from '../actions/settings';

export interface State {
    favoriteRacers: Racer[];
    delay: number;
}

const initialState: State = {
    favoriteRacers: [],
    delay: 0
};


export function reducer(state: State = initialState, action: SettingsActions.SettingsAction): State {
    switch (action.type) {
        case SettingsActions.TOGGLE_FAVORITE:
            const racer: Racer = action.payload;

            if (state.favoriteRacers.find((row) => row.id === racer.id) != null) {
                return {
                    favoriteRacers: state.favoriteRacers.reduce((arr, row) => (racer.id === row.id) ? arr : arr.concat(row), []),
                    delay: state.delay
                };
            }

            return {
                favoriteRacers: [...state.favoriteRacers, racer],
                delay: state.delay
            };

        case SettingsActions.SET_DELAY:
            const delay: number = action.payload;

            return {
                favoriteRacers: state.favoriteRacers,
                delay: delay
            };

        case SettingsActions.RESET:
            return initialState;


        default:
            return state;
    }
}

export const getFavoriteRacers = (state: State) => state.favoriteRacers;

export const getDelay = (state: State) => state.delay;

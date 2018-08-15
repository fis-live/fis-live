import { Racer } from '../../models/racer';
import { SettingsAction, SettingsActionTypes } from '../actions/settings';

export interface State {
    favoriteRacers: Racer[];
    delay: number;
}

const initialState: State = {
    favoriteRacers: [],
    delay: 0
};


export function reducer(state: State = initialState, action: SettingsAction): State {
    switch (action.type) {
        case SettingsActionTypes.ToggleFavorite:
            const racer: Racer = action.payload;

            if (state.favoriteRacers.find((row) => row.id === racer.id) !== undefined) {
                return {
                    favoriteRacers: state.favoriteRacers.reduce((arr: Racer[], row) => (racer.id === row.id) ? arr : arr.concat(row), []),
                    delay: state.delay
                };
            }

            return {
                favoriteRacers: [...state.favoriteRacers, racer],
                delay: state.delay
            };

        case SettingsActionTypes.SetDelay:
            const delay: number = action.payload;

            return {
                favoriteRacers: state.favoriteRacers,
                delay: delay
            };

        case SettingsActionTypes.Reset:
            return initialState;


        default:
            return state;
    }
}

export const getFavoriteRacers = (state: State) => state.favoriteRacers;

export const getDelay = (state: State) => state.delay;

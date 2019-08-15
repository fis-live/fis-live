import { Action, createReducer, on } from '@ngrx/store';

import { Racer } from '../../models/racer';
import { SettingsActions } from '../actions';

export interface State {
    favoriteRacers: Racer[];
    delay: number;
}

const initialState: State = {
    favoriteRacers: [],
    delay: 0
};

const settingsReducer = createReducer(
    initialState,
    on(SettingsActions.toggleFavorite, (state, { racer }) => {
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
    }),
    on(SettingsActions.setDelay, (state, { delay }) => ({...state, delay})),
    on(SettingsActions.resetSettings, () => initialState)
);

export function reducer(state: State | undefined, action: Action) {
    return settingsReducer(state, action);
}

export const getFavoriteRacers = (state: State) => state.favoriteRacers;

export const getDelay = (state: State) => state.delay;

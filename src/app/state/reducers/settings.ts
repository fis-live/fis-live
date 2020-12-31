import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Action, createReducer, on } from '@ngrx/store';

import { Column } from '../../datagrid/state/model';
import { Racer } from '../../models/racer';
import { SettingsActions } from '../actions';

export interface State {
    favoriteRacers: Racer[];
    delay: number;
    defaultColumns: Column[];
    tickerEnabled: boolean;
}

const defaultColumns = [
    { id: 'order', name: '#', toggled: false, isDynamic: false },
    { id: 'rank', name: 'Rank', toggled: true, isDynamic: false },
    { id: 'bib', name: 'Bib', toggled: true, isDynamic: false },
    { id: 'name', name: 'Name', toggled: true, isDynamic: false },
    { id: 'time', name: 'Time', toggled: true, isDynamic: false },
    { id: 'nsa', name: 'NSA', toggled: true, isDynamic: false },
    { id: 'diff', name: 'Diff.', toggled: true, isDynamic: false },
    { id: 'tour', name: 'Tour Std.', toggled: false, isDynamic: false }
];

const initialState: State = {
    favoriteRacers: [],
    delay: 0,
    defaultColumns,
    tickerEnabled: false
};

const settingsReducer = createReducer(
    initialState,
    on(SettingsActions.toggleFavorite, (state, { racer }) => {
        if (state.favoriteRacers.find((row) => row.id === racer.id) !== undefined) {
            return {
                ...state,
                favoriteRacers: state.favoriteRacers.reduce((arr: Racer[], row) => (racer.id === row.id) ? arr : arr.concat(row), [])
            };
        }

        return {
            ...state,
            favoriteRacers: [...state.favoriteRacers, racer]
        };
    }),
    on(SettingsActions.setDelay, (state, { delay }) => ({...state, delay})),
    on(SettingsActions.toggleColumn, (state, { column }) => {
        const colIdx = state.defaultColumns.findIndex((col) => col.id === column);
        const columns = state.defaultColumns.slice();
        if (colIdx > -1) {
            columns[colIdx] = {
                ...columns[colIdx],
                toggled: !columns[colIdx].toggled
            };

            return {
                ...state,
                defaultColumns: columns
            };
        }

        return state;
    }),
    on(SettingsActions.reorderColumn, (state, { previousIndex, currentIndex }) => {
        if (previousIndex === currentIndex) {
            return state;
        }

        const array = state.defaultColumns.slice();
        moveItemInArray(array, previousIndex, currentIndex);

        return {
            ...state,
            defaultColumns: array
        };
    }),
    on(SettingsActions.toggleTicker, (state) => ({...state, tickerEnabled: !state.tickerEnabled})),
    on(SettingsActions.resetSettings, () => initialState)
);

export function reducer(state: State | undefined, action: Action) {
    return settingsReducer(state, action);
}

export const getFavoriteRacers = (state: State) => state.favoriteRacers;

export const getDelay = (state: State) => state.delay;

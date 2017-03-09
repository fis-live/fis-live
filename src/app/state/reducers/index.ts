import { compose } from '@ngrx/core';
import { ActionReducer, combineReducers } from '@ngrx/store';
import { createSelector } from 'reselect';
import { storeFreeze } from 'ngrx-store-freeze';
import { localStorageSync } from 'ngrx-store-localstorage';

import * as Alert from './alert';
import * as Inter from './intermediate';
import * as RaceInfo from './race-info';
import * as Racer from './racer';
import * as Result from './result';
import * as Settings from './settings';
import * as Loading from './loading';
import { ConnectionActions } from '../actions/connection';
import { getDelay } from './settings';

const reducers: { [key: string]: ActionReducer<any> } = {
    alert: Alert.reducer,
    intermediates: Inter.reducer,
    raceInfo: RaceInfo.reducer,
    racers: Racer.reducer,
    result: Result.reducer,
    settings: Settings.reducer,
    loading: Loading.reducer,
};

export interface AppState {
    alert: Alert.State;
    intermediates: Inter.State;
    raceInfo: RaceInfo.State;
    racers: Racer.State;
    result: Result.State;
    settings: Settings.State;
    loading: Loading.State;
}


let metaReducer;

export const BATCH_ACTION = 'BATCHING_REDUCER.BATCH';

const enableBatching = (reducer: Function) => {
    return function batchingReducer(state, action) {
        switch (action.type) {
            case BATCH_ACTION:
                return action.payload.reduce(batchingReducer, state);
            default:
                return reducer(state, action);
        }
    };
};

const resetState = (reducer: Function) => {
    return function(state, action) {
        if (action.type === ConnectionActions.RESET) {
            state = undefined;
        }

        return reducer(state, action);
    };
};

if (process.env.ENV === 'production') {
    metaReducer = compose(resetState, enableBatching, localStorageSync(['settings'], true), combineReducers);
} else {
    metaReducer = compose(storeFreeze, enableBatching, resetState, localStorageSync(['settings'], true), combineReducers);
}

export function reducer(state: any, action: any): any {
    return metaReducer(reducers)(state, action);
}


export const getAlertState = (state: AppState) => state.alert;
export const getInterState = (state: AppState) => state.intermediates;
export const getRaceInfoState = (state: AppState) => state.raceInfo;
export const getRacerState = (state: AppState) => state.racers;
export const getResultState = (state: AppState) => state.result;
export const getSettingsState = (state: AppState) => state.settings;
export const getLoadingState = (state: AppState) => state.loading;

export const getDropdownItems = createSelector(getInterState, Inter.getInterAsDropdownItems);
export const getRacers = createSelector(getRacerState, Racer.getRacerEntities);

export const getFavoriteRacers = createSelector(getRacers, getSettingsState,
        (racers, settings) => {
            const _racers = [];
            Object.keys(racers).forEach((key) => {
                _racers[key] = Object.assign({}, racers[key], {
                        isFavorite: settings.favoriteRacers.find((racer) => racer.id === racers[key].id) != null
                    });
            });

            return _racers;
        }
);

export const getDelayState = createSelector(getSettingsState, getDelay);

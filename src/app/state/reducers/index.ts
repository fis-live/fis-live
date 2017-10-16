import { ActionReducer, MetaReducer, createSelector } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { localStorageSync } from 'ngrx-store-localstorage';
import { ActionReducerMap } from '@ngrx/store';

import * as Alert from './alert';
import * as Inter from './intermediate';
import * as RaceInfo from './race-info';
import * as Racer from './racer';
import * as Result from './result';
import * as Settings from './settings';
import * as Loading from './loading';
import * as ConnectionActions from '../actions/connection';

export const reducers: ActionReducerMap<AppState> = {
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


export function enableBatching(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return function batchingReducer(state, action: any) {
        switch (action.type) {
            case ConnectionActions.BATCH:
                return action.payload.reduce(batchingReducer, state);
            default:
                return reducer(state, action);
        }
    };
}

export function resetState(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return function(state, action) {
        if (action.type === ConnectionActions.RESET) {
            state = undefined;
        }

        return reducer(state, action);
    };
}

export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return localStorageSync({keys: ['settings'], removeOnUndefined: true, rehydrate: true})(reducer);
}

export const metaReducers: MetaReducer<AppState>[] = process.env.ENV === 'production' ?
    [enableBatching, resetState, localStorageSyncReducer] :
    [storeFreeze, enableBatching, resetState, localStorageSyncReducer];

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

export const getDelayState = createSelector(getSettingsState, Settings.getDelay);

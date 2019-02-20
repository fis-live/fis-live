import { ActionReducer, ActionReducerMap, createSelector, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import { ConnectionActionTypes } from '../actions/connection';

import * as Alert from './alert';
import * as Calendar from './calendar';
import * as Loading from './loading';
import * as RaceInfo from './race-info';
import * as Result from './result';
import * as Settings from './settings';

export const reducers: ActionReducerMap<AppState, any> = {
    alert: Alert.reducer,
    raceInfo: RaceInfo.reducer,
    result: Result.reducer,
    settings: Settings.reducer,
    loading: Loading.reducer,
    calendar: Calendar.reducer
};

export interface AppState {
    alert: Alert.State;
    raceInfo: RaceInfo.State;
    result: Result.State;
    settings: Settings.State;
    loading: Loading.State;
    calendar: Calendar.State;
}


export function enableBatching(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return function batchingReducer(state, action: any) {
        switch (action.type) {
            case ConnectionActionTypes.Batch:
                return action.payload.reduce(batchingReducer, state);
            default:
                return reducer(state, action);
        }
    };
}

export function resetState(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return function(state, action) {
        if (state !== undefined && action.type === ConnectionActionTypes.Reset) {
            return {...reducer(undefined, action), settings: state.settings, calendar: state.calendar};
        }

        return reducer(state, action);
    };
}

export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return localStorageSync({keys: ['settings'], removeOnUndefined: true, rehydrate: true})(reducer);
}

export const metaReducers: MetaReducer<AppState>[] = [enableBatching, resetState, localStorageSyncReducer];

export const getAlertState = (state: AppState) => state.alert;
export const getCalendarState = (state: AppState) => state.calendar;
export const getRaceInfoState = (state: AppState) => state.raceInfo;
export const getResultState = (state: AppState) => state.result;
export const getSettingsState = (state: AppState) => state.settings;
export const getLoadingState = (state: AppState) => state.loading;

export const selectAllIntermediates = createSelector(getResultState, Result.getIntermediates);

export const selectRacesByPlace = createSelector(getCalendarState, Calendar.getRacesByPlace);

export const getDelayState = createSelector(getSettingsState, Settings.getDelay);

export const selectEvents = createSelector(getResultState, Result.getEvents);

export const selectAllRacers = createSelector(getResultState, Result.getAllRacers);


export const { selectAll: selectAllResults } = Result.adapter.getSelectors(getResultState);

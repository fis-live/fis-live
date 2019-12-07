import { Action, ActionReducer, ActionReducerMap, createReducer, createSelector, MetaReducer, on, select } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { OperatorFunction, pipe } from 'rxjs';

import { View } from '../../datagrid/providers/config';
import { ResultItem } from '../../models/table';
import { ConnectionActions } from '../actions';

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
    return function batchingReducer(state, action: Action): AppState {
        const r = on(ConnectionActions.batch, (_state: AppState, { actions }) => actions.reduce(batchingReducer, _state));
        if (action.type === ConnectionActions.batch.type) {
            return r.reducer(state, action);
        } else {
            return reducer(state, action);
        }
    };
}

export function resetState(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return function(state, action) {
        if (state !== undefined && action.type === ConnectionActions.reset.type) {
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

export const selectRacesByDate = createSelector(getCalendarState, Calendar.getRacesByDate);

export const getDelayState = createSelector(getSettingsState, Settings.getDelay);

export const selectEvents = createSelector(getResultState, Result.getEvents);

export const selectAllRacers = createSelector(getResultState, Result.getAllRacers);

export const selectView = (view: View): OperatorFunction<AppState, ResultItem[]> => {
    return pipe(
        select(getResultState),
        Result.createViewSelector(view)
    );
};

export const { selectAll: selectAllResults } = Result.adapter.getSelectors(getResultState);

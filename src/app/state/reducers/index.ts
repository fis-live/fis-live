import { ActionReducer, ActionReducerMap, createSelector, MetaReducer, select } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { OperatorFunction, pipe } from 'rxjs';

import { ResultItem, View } from '../../datagrid/state/model';
import { State } from '../../fis/cross-country/models';

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
    result: State;
    settings: Settings.State;
    loading: Loading.State;
    calendar: Calendar.State;
}

export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return localStorageSync({keys: ['settings'], removeOnUndefined: true, rehydrate: true})(reducer);
}

export const metaReducers: MetaReducer<AppState>[] = [localStorageSyncReducer];

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

export const selectAllRacers = createSelector(getResultState, Result.getAllRacers);

export const selectFavoriteRacers = createSelector(getSettingsState, Settings.getFavoriteRacers);

export const selectView = (view: View): OperatorFunction<AppState, ResultItem[]> => {
    return pipe(
        select(getResultState),
        Result.createViewSelector(view)
    );
};

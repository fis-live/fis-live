import { ActionReducer, combineReducers } from '@ngrx/store';

import * as fromRacer from "./racer";
import * as Result from "./result";
import * as Info from "./race-info";
import * as Inter from "./intermediate";
import * as Error from './error';
import * as Loading from './loading';
import { Observable } from "rxjs/Observable";
import { compose } from "@ngrx/core";

import { Racer } from '../models/racer';
import { Intermediate } from '../models/intermediate';

import { storeFreeze } from 'ngrx-store-freeze';


const reducers: { [key: string]: ActionReducer<any> } = {
    result: Result.reducer,
    racer: fromRacer.reducer,
    info: Info.reducer,
    intermediate: Inter.reducer,
    error: Error.reducer,
    loading: Loading.reducer
};

let metaReducer;
if (process.env.ENV === 'production') {
    metaReducer = combineReducers;
} else {
    metaReducer = compose(storeFreeze, combineReducers);
}

export function reducer(state: any, action: any): any {
    return metaReducer(reducers)(state, action);
}

export interface AppState {
    result: Result.State;
    racer: fromRacer.State;
    info: Info.State;
    intermediate: Inter.State;
    error: Error.State;
    loading: Loading.State;
}

export function getRacerState(state$: Observable<AppState>) {
    return state$.select(state => state.racer);
}

export function getRaceInfoState(state$: Observable<AppState>): Observable<Info.State> {
    return state$.select(state => state.info);
}

export function getIntermediateState(state$: Observable<AppState>) {
    return state$.select(state => state.intermediate);
}

export function getErrorState(state$: Observable<AppState>): Observable<Error.State> {
    return state$.select(state => state.error);
}

export function getLoadingState(state$: Observable<AppState>) {
    return state$.select(state => state.loading);
}

export function getResultState(state$: Observable<AppState>) {
    return state$.select(state => state.result);
}


export const getRacers = compose(fromRacer.getRacerEntities, getRacerState);


export const getIntermediates = compose(Inter.getAllIntermediates, getIntermediateState);

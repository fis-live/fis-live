import { ActionReducer, combineReducers } from '@ngrx/store';

import * as Racer from "./racer";
import * as Result from "./result";
import * as Info from "./race-info";
import * as Inter from "./intermediate";
import { Observable } from "rxjs/Observable";
import { compose } from "@ngrx/core";


const reducers: { [key: string]: ActionReducer<any> } = {
    result: Result.reducer,
    racer: Racer.reducer,
    info: Info.reducer,
    intermediate: Inter.reducer
};

export function reducer(state: any, action: any): any {
    return combineReducers(reducers)(state, action);
}

export interface AppState {
    result: Result.State;
    racer: Racer.State;
    info: Info.State;
    intermediate: Inter.State;
}

export function getRacerState() {
    return (state$: Observable<AppState>) => state$.select(state => state.racer);
}

export function getRaceInfoState(state$: Observable<AppState>) {
    return state$.select(state => state.info);
}

export function getIntermediateState(state$: Observable<AppState>) {
    return state$.select(state => state.intermediate);
}


export function getRacer(id: number) {
    return compose(Racer.getRacer(id), getRacerState());
}

export const getRaceInfo = compose(Info.getRaceInfo, getRaceInfoState);

export const getIntermediates = compose(Inter.getAllIntermediates, getIntermediateState);

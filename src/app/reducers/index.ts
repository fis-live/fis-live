import { ActionReducer, combineReducers } from '@ngrx/store';

import * as Racer from "./racer";
import * as Result from "./result";


const reducers: { [key: string]: ActionReducer<any> } = {
    result: Result.reducer,
    racer: Racer.reducer
};

export function reducer(state: any, action: any): any {
    return combineReducers(reducers)(state, action);
}

export interface AppState {
    result: Result.State;
    racer: Racer.State;
}
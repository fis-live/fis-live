import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";
import { Observable } from "rxjs/Observable";
import { Intermediate } from "../Model/intermediate";
import { combineLatest } from "rxjs/observable/combineLatest";

export interface State {
    ids: number[];
    entities: { [id: number]: Intermediate };
}

const initialState: State = {
    ids: [],
    entities: {}
};


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case RaceActions.ADD_INTERMEDIATE:
            const inter: Intermediate = action.payload;

            if (state.ids.includes(inter.id)) {
                return state;
            }

            return {
                ids: [ ...state.ids, inter.id ],
                entities: Object.assign({}, state.entities, {
                    [inter.id]: inter
                })
            };


        default:
            return state;
    }
}

export function getIntermediateIds(state$: Observable<State>) {
    return state$.select(state => state.ids);
}

export function getIntermediateEntities(state$: Observable<State>) {
    return state$.select(state => state.entities);
}

export function getAllIntermediates(state$: Observable<State>) {
    return combineLatest<{ [id: number]: Intermediate }, number[]>(
        state$.let(getIntermediateEntities),
        state$.let(getIntermediateIds)
    )
        .map(([ entities, ids ]) => ids.map(id => entities[id]));
}
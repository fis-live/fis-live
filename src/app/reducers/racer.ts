import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";
import { Racer } from "../models/racer";
import { Observable } from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";

export interface State {
    ids: number[];
    entities: { [id: number]: Racer };
}

const initialState: State = {
    ids: [],
    entities: {}
};


export function reducer(state: State = initialState, action: Action): State {
    switch (action.type) {
        case RaceActions.ADD_RACER:
            const racer: Racer = action.payload;

            if (state.ids.includes(racer.bib)) {
                return state;
            }

            return {
                ids: [ ...state.ids, racer.bib ],
                entities: Object.assign({}, state.entities, {
                    [racer.bib]: racer
                })
            };


        default:
            return state;
    }
}

export function getRacerIds(state$: Observable<State>) {
    return state$.select(state => state.ids);
}

export function getRacerEntities(state$: Observable<State>) {
    return state$.select(state => state.entities);
}

export function getAllRacers(state$: Observable<State>) {
    return combineLatest<{ [id: number]: Racer }, number[]>(
        state$.let(getRacerEntities),
        state$.let(getRacerIds)
    )
        .map(([ entities, ids ]) => ids.map(id => entities[id]));
}
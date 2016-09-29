import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";
import { Racer } from "../Model/racer";
import { Observable } from "rxjs/Observable";

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

export function getRacer(id: number) {
    return (state$: Observable<State>) => state$.select(state => state.entities[id]);
}
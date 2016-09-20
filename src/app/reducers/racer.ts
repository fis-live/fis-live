import { Action } from '@ngrx/store';

import { ADD_RACER } from "../actions";
import { Racer } from "../Model/racer";

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
        case ADD_RACER:
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
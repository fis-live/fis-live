import { Action, createReducer, createSelector, on } from '@ngrx/store';

import { Intermediate } from '../../models/intermediate';
import { RaceActions } from '../actions';

export interface State {
    ids: number[];
    entities: { [id: number]: Intermediate };
}

const initialState: State = {
    ids: [],
    entities: {}
};

const intermediateReducer = createReducer(
    initialState,
    on(RaceActions.addIntermediate, (state, { intermediate }) => {
        if (state.ids.indexOf(intermediate.id) >= 0) {
            return state;
        }

        return {
            ids: [ ...state.ids, intermediate.id ],
            entities: Object.assign({}, state.entities, {
                [intermediate.id]: intermediate
            })
        };
    })
);

export function reducer(state: State | undefined, action: Action) {
    return intermediateReducer(state, action);
}

export const getIntermediateIds = (state: State) => state.ids;

export const getIntermediateEntities = (state: State) => state.entities;

export const getAllIntermediates = createSelector(
    getIntermediateIds,
    getIntermediateEntities,
    (ids, entities) => ids.map(id => entities[id])
);

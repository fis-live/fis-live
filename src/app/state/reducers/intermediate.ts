import { createSelector } from 'reselect';

import * as RaceActions from '../actions/race';
import { Intermediate } from '../../models/intermediate';

export interface State {
    ids: number[];
    entities: { [id: number]: Intermediate };
}

const initialState: State = {
    ids: [],
    entities: {}
};


export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
    switch (action.type) {
        case RaceActions.ADD_INTERMEDIATE:
            const inter: Intermediate = action.payload;

            if (state.ids.indexOf(inter.id) >= 0) {
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

export const getIntermediateIds = (state: State) => state.ids;

export const getIntermediateEntities = (state: State) => state.entities;

export const getAllIntermediates = createSelector(
    getIntermediateIds,
    getIntermediateEntities,
    (ids, entities) => ids.map(id => entities[id])
);

export const getInterAsDropdownItems = createSelector(getAllIntermediates, (intermediates) => {
    return intermediates.map(row => ({
        data_value: row.id,
        selected_text: row.distance == null ? row.name : row.distance + ' KM',
        default_text: row.distance == null ? row.name : row.distance + ' KM'
    }));
});

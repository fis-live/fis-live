import { Action } from '@ngrx/store';
import { createSelector } from 'reselect';

import { RaceActions } from '../actions';
import { Racer } from '../../models/racer';

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

            if (state.ids.indexOf(racer.bib) >= 0) {
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

export const getRacerIds = (state: State) => state.ids;

export const getRacerEntities = (state: State) => state.entities;

export const getAllRacers = createSelector(getRacerIds, getRacerEntities, (ids, entities) => ids.map(id => entities[id]));

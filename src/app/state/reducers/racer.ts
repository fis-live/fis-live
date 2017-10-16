import { createSelector } from '@ngrx/store';

import * as RaceActions from '../actions/race';
import { Racer } from '../../models/racer';

export interface State {
    ids: number[];
    entities: { [id: number]: Racer };
}

const initialState: State = {
    ids: [],
    entities: {}
};


export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
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

        case RaceActions.SET_BIB_COLOR:
            const id: number = action.payload.racer;
            const color: string = action.payload.color;

            if (state.ids.indexOf(id) >= 0) {
                return {
                    ids: state.ids,
                    entities: Object.assign({}, state.entities, {
                        [id]: Object.assign({}, state.entities[id], {color: color})
                    })
                };
            }

            return state;

        default:
            return state;
    }
}

export const getRacerIds = (state: State) => state.ids;

export const getRacerEntities = (state: State) => state.entities;

export const getAllRacers = createSelector(getRacerIds, getRacerEntities, (ids, entities) => ids.map(id => entities[id]));

import { createEntityAdapter, EntityAdapter, EntityState, Update } from '@ngrx/entity';

import { maxVal } from '../../fis/fis-constants';
import { Racer, RacerAndTime, RacerData } from '../../models/racer';
import { RaceAction, RaceActionTypes } from '../actions/race';

import { getValidDiff, registerResult, updateResult } from './helpers';

export interface State extends EntityState<RacerData> {
    interMap: {[id: number]: number};
    sortedTimes: {[id: number]: RacerAndTime[]};
    history: any[];
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({interMap: {}, sortedTimes: {}, history: []});

export function reducer(state: State = initialState, action: RaceAction): State {
    switch (action.type) {
        case RaceActionTypes.AddIntermediate: {
            return {
                ...state,
                interMap: {...state.interMap, [action.payload.id]: action.payload.key},
                sortedTimes: {...state.sortedTimes, [action.payload.key]: []}
            };
        }

        case RaceActionTypes.AddRacer: {
            const racer: Racer = action.payload;

            return adapter.addOne({
                id: racer.bib,
                status: '',
                racer: racer,
                results: [{time: 0, rank: null, diffs: [0]}],
                notes: []
            }, state);
        }

        case RaceActionTypes.AddNote: {
            return adapter.updateOne({
                id: action.payload.racer,
                changes: {
                    notes: [...state.entities[action.payload.racer].notes, 'W']
                }
            }, state);
        }

        case RaceActionTypes.AddStartList: {
            return adapter.updateOne({
                id: action.payload.racer,
                changes: {
                    status: action.payload.status,
                    results: [{time: 0, rank: action.payload.order, diffs: [0]}]
                }
            }, state);
        }

        case RaceActionTypes.SetStartTime: {
            const results = [...state.entities[action.payload.racer].results];
            results[0] = {...results[0], time: action.payload.time, diffs: [action.payload.time]};
            for (let i = 1; i < results.length; i++) {
                const diffs = [...results[i].diffs];
                diffs[0] = getValidDiff(results[i].time, action.payload.time);

                results[i] = {...results[i], diffs};
            }

            return adapter.updateOne({id: action.payload.racer, changes: {results: results}}, state);
        }

        case RaceActionTypes.SetStatus: {
            return {
                ...adapter.updateOne({
                id: action.payload.id,
                changes: {
                    status: action.payload.status
                }
            }, state), history: [{racer: action.payload.id, inter: 0, update: true}, ...state.history]};
        }

        case RaceActionTypes.RegisterResult: {
            const inter = state.interMap[action.payload.intermediate];
            const time = action.payload.time || maxVal * 6;
            const racer = action.payload.racer;

            const sortedTimes = [...state.sortedTimes[inter]];
            let changes: Update<RacerData>[] = [];

            if (state.entities[racer].results.length > inter) {
                if (state.entities[racer].results[inter].time < maxVal) {
                    const index = sortedTimes.findIndex((val) => val.racer === racer);
                    sortedTimes.splice(index, 1);
                }
                changes = updateResult(state, racer, time, inter);
            } else {
                changes = registerResult(state, racer, time, inter);
            }

            if (time < maxVal) {
                sortedTimes.push({racer, time});
            }

            return {
                ...adapter.updateMany(changes, state),
                sortedTimes: {...state.sortedTimes, [inter]: sortedTimes},
                history: [{racer, inter}, ...state.history]
            };
        }

        default:
            return state;
    }
}

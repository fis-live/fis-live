import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";

export interface Item {
    racer: string;
    time: number;
    rank: number;
}

export interface State {
    startList: Array<{order: number, racer: number, status: string}>;
    [intermediate: number]: {
        fastest: number,
        entities: Array<Item>
    };
}

export function reducer(state: State = {startList: []}, action: Action): State {
    switch (action.type) {
        case RaceActions.ADD_START_LIST:
            return Object.assign({}, state, {startList: state.startList.concat(action.payload)});

        case RaceActions.REGISTER_RESULT:
            let item = action.payload;
            let rank = 1;

            if (state[item.intermediate] == null) {
                return Object.assign({}, state, {[item.intermediate]: {
                    fastest: item.time,
                    entities: [{racer: item.racer, time: item.time, rank: rank}]}}
                );
            }

            let _state = state[item.intermediate].entities.map(row => {
                    if (row.time < item.time) {
                        rank += 1;

                        return row;
                    }

                    return Object.assign({}, row, {rank: row.rank + 1})
                }
            );

            return Object.assign({}, state, {
                [item.intermediate]: {
                    entities: _state.concat({racer: item.racer, time: item.time, rank: rank}),
                    fastest: item.time < state[item.intermediate].fastest ? item.time : state[item.intermediate].fastest
                }
            });


        default:
            return state;
    }
}
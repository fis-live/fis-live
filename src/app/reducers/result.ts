import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";

export interface Item {
    racer: string;
    time: number;
    rank: number;
}

export interface State {
    [intermediate: number]: {
        fastest: number,
        latest: Array<number>,
        entities: Array<Item>
    };
}

export function reducer(state: State = {}, action: Action): State {
    switch (action.type) {
        case RaceActions.REGISTER_RESULT:
            let item = action.payload;
            let rank = 1;

            if (state[item.intermediate] == null) {
                return Object.assign({}, state, {[item.intermediate]: {
                    fastest: item.time,
                    latest: [item.racer.id],
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
            //let rank = state.reduce((prev, cur) => (item.time < cur.time) ? prev : prev + 1, 1);

            return Object.assign({}, state, {
                [item.intermediate]: {
                    entities: _state.concat({racer: item.racer, time: item.time, rank: rank}),
                    fastest: item.time < state[item.intermediate].fastest ? item.time : state[item.intermediate].fastest,
                    latest: []
                }
            });


        default:
            return state;
    }
}
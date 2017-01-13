import { Action } from '@ngrx/store';

import { RaceActions } from "../actions";

export interface Item {
    racer: string;
    time: number;
    rank: number;
}

export interface State {
    startList: Array<{order: number, racer: number, status: string, time: number | null, color: string}>;
    [intermediate: number]: {
        fastest: number,
        entities: Array<Item>
    };
}

export function reducer(state: State = {startList: []}, action: Action): State {
    switch (action.type) {
        case RaceActions.ADD_START_LIST:
            return Object.assign({}, state, {startList: state.startList.concat(action.payload)});

        case RaceActions.SET_STATUS:
            const id: number = action.payload.id;
            let status: string = action.payload.status;

            let startlist = state.startList.map((row) => {
                let newRow = Object.assign({}, row);
                if (row.racer == id) {
                    newRow.status = status;
                }

                return newRow;
            });


            return Object.assign({}, state, {startList: startlist});

        case 'UPDATE_START_LIST':
            let fastest = 999999999999;
            action.payload.forEach(row => {
                if (row.time !== null && row.time < fastest) {
                    fastest = row.time;
                }
            });


            let updatedstartlist = state.startList.map((row) => {
                let newRow = Object.assign({}, row);
                if (action.payload[row.racer]) {
                    newRow.time = (action.payload[row.racer].time !== null) ? action.payload[row.racer].time - fastest : null;
                    newRow.color = action.payload[row.racer].shirt;
                }

                return newRow;
            });

            return Object.assign({}, state, {startList: updatedstartlist});

        case RaceActions.REGISTER_RESULT:
            let item = action.payload;
            let rank = 1;

            if (item.time == null) {
                if (state[item.intermediate] == null) {
                    return Object.assign({}, state, {[item.intermediate]: {
                        fastest: 999999999999,
                        entities: [{racer: item.racer, time: item.time, rank: null}]}}
                    );
                }

                return Object.assign({}, state, {[item.intermediate]: {
                    fastest: state[item.intermediate].fastest,
                    entities: state[item.intermediate].entities.concat({racer: item.racer, time: item.time, rank: null})}
                });
            }

            if (state[item.intermediate] == null) {
                return Object.assign({}, state, {[item.intermediate]: {
                    fastest: item.time,
                    entities: [{racer: item.racer, time: item.time, rank: rank}]}}
                );
            }

            let duplicate = false;

            let _state = state[item.intermediate].entities.map(row => {
                    if (row.racer == item.racer) {
                        duplicate = true;

                        return Object.assign({}, row, {time: item.time})
                    }
                    if (row.time == null) {
                        return row;
                    }

                    if (row.time < item.time) {
                        rank += 1;

                        return row;
                    } else if (row.time == item.time) {
                        return row;
                    }

                    return Object.assign({}, row, {rank: row.rank + 1})
                }
            );

            if (duplicate) {
                let count = _state.length;
                let fastest = 999999999999;
                for (let i = 0; i < count; i++) {
                    let rank = 1;
                    if (_state[i].time < fastest) {
                        fastest = _state[i].time;
                    }

                    for (let j = 0; j < count; i++) {
                        if (_state[i].time > _state[j].time) {
                            rank += 1;
                        }
                    }

                    _state[i].rank = rank;
                }

                return Object.assign({}, state, {
                    [item.intermediate]: {
                        entities: _state,
                        fastest: fastest
                    }
                });
            }

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
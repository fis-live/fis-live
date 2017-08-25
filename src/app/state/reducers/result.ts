import * as RaceActions from '../actions/race';

export interface Item {
    racer: number;
    time: number;
    rank: number;
    status: string;
}

export interface State {
    [intermediate: number]: {
        fastest: number,
        entities: Item[]
    };
}

export function reducer(state: State = {[0]: {fastest: null, entities: []}}, action: RaceActions.RaceAction): State {
    const maxVal = 1000000000;

    switch (action.type) {
        case RaceActions.ADD_START_LIST:
            return Object.assign({}, state, {[0]: {
                fastest: null,
                entities: state[0].entities.concat({
                    racer: action.payload.racer,
                    status: action.payload.status,
                    rank: action.payload.order,
                    time: 0
                })
            }});

        case RaceActions.SET_START_TIME:
            const newStartList = state[0].entities.map((row) => {
                const _row = Object.assign({}, row);
                if (row.racer === action.payload.racer) {
                    _row.time = action.payload.time;
                }

                return _row;
            });

            return Object.assign({}, state, {[0]: {
                fastest: (state[0].fastest == null || action.payload.time < state[0].fastest) ? action.payload.time : state[0].fastest,
                entities: newStartList
            }});

        case RaceActions.SET_STATUS:
            const id: number = action.payload.id;
            const _status: string = action.payload.status;

            const startList = state[0].entities.map((row) => {
                const _row = Object.assign({}, row);
                if (row.racer === id) {
                    _row.status = _status;
                }

                return _row;
            });


            return Object.assign({}, state, {[0]: {
                fastest: null,
                entities: startList
            }});

        case RaceActions.REGISTER_RESULT:
            const item = action.payload;
            const time = item.time || maxVal * 6;
            const status = (item.time && item.status.length > 0) ? item.status : 'N/A';
            let rank = (time >= maxVal) ? null : 1;
            let duplicate = false;
            let prevTime;

            if (state[item.intermediate] == null) {
                return Object.assign({}, state, {[item.intermediate]: {
                    fastest: time,
                    entities: [{racer: item.racer, status: status, time: time, rank: rank}]}}
                );
            }

            let _state = state[item.intermediate].entities.map(row => {
                    if (row.racer === item.racer) {
                        duplicate = true;
                        prevTime = row.time;

                        return Object.assign({}, row, {status: status, time: time});
                    }
                    if (rank === null) {
                        return row;
                    }

                    if (row.time < time) {
                        rank += 1;

                        return row;
                    } else if (row.time === time) {
                        return row;
                    }

                    return Object.assign({}, row, {rank: row.rank !== null ? row.rank + 1 : null});
                }
            );

            if (duplicate) {
                let fastest = maxVal;

                _state = _state.map(row => {
                    if (row.time < fastest) {
                        fastest = row.time;
                    }

                    if (row.racer === item.racer) {
                        return Object.assign({}, row, {rank: rank});
                    }

                    if (row.time >= maxVal) {
                        return row;
                    }

                    if (row.time <= prevTime) {
                        return row;
                    }

                    return Object.assign({}, row, {rank: row.rank - 1});
                });

                return Object.assign({}, state, {
                    [item.intermediate]: {
                        entities: _state,
                        fastest: fastest
                    }
                });
            }

            return Object.assign({}, state, {
                [item.intermediate]: {
                    entities: _state.concat({racer: item.racer, status: status, time: time, rank: rank}),
                    fastest: time < state[item.intermediate].fastest ? time : state[item.intermediate].fastest
                }
            });


        default:
            return state;
    }
}

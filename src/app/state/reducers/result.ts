import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { maxVal } from '../../fis/fis-constants';
import { Racer } from '../../models/racer';
import * as RaceActions from '../actions/race';

export interface RacerData {
    id: number;
    racer: Racer;
    status: string;
    times: {time: number; rank: number}[];
    diffs: number[][];
    notes: string[];
}

export interface State extends EntityState<RacerData> {
    interMap: {[id: number]: number};
    sortedTimes: {[id: number]: {racer: number; time: number}[]};
    history: any[];
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({interMap: {}, sortedTimes: {}, history: []});

const getValidDiff = (time, zero) => {
    if (time == null || zero == null) {
        return maxVal;
    } else if (time >= maxVal || zero >= maxVal) {
        return maxVal;
    }

    return time - zero;
};

const updateDiffs = (times, inter) => {
    const diffs = [];
    for (let i = inter + 1; i < times.length; i++) {
        const diff = [];
        for (let j = 0; j < i; j++) {
            diff[j] = getValidDiff(times[i].time, times[j].time);
        }

        diffs.push(diff);
    }

    return diffs;
};

const insertTime = (state, sortedTimes, _times, racer, time, inter) => {
    const changes: any = [];

    if (time < maxVal) {
        const length = sortedTimes.length;
        let rank: number = 1;
        for (let i = 0; i < length; i++) {
            if (time < sortedTimes[i].time) {
                const timeRow = [...state.entities[sortedTimes[i].racer].times];
                timeRow[inter] = {time: sortedTimes[i].time, rank: timeRow[inter].rank + 1};
                changes.push({
                    id: sortedTimes[i].racer,
                    changes: {times: timeRow}
                });
            } else if (time > sortedTimes[i].time) {
                rank += 1;
            }
        }

        _times[inter] = {time, rank};
        sortedTimes.push({time, racer});
    } else {
        _times[inter] = {time, rank: null};
    }

    return changes;
};

export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
    switch (action.type) {
        case RaceActions.ADD_INTERMEDIATE: {
            return {
                ...state,
                interMap: {...state.interMap, [action.payload.id]: action.payload.key},
                sortedTimes: {...state.sortedTimes, [action.payload.key]: []}
            };
        }

        case RaceActions.ADD_RACER: {
            const racer: Racer = action.payload;

            return adapter.addOne({
                id: racer.bib,
                status: '',
                racer: racer,
                times: [{time: 0, rank: null}],
                diffs: [[0]],
                notes: []
            }, state);
        }

        case RaceActions.ADD_NOTE: {
            return adapter.updateOne({
                id: action.payload.racer,
                changes: {
                    notes: [...state.entities[action.payload.racer].notes, 'W']
                }
            }, state);
        }

        // case RaceActions.SET_BIB_COLOR: {
        //     return adapter.updateOne({
        //         id: action.payload.racer,
        //         changes: {
        //             racer: {...state.entities[action.payload.racer].racer, color: action.payload.color}
        //         }
        //     }, state);
        // }

        case RaceActions.ADD_START_LIST: {
            return adapter.updateOne({
                id: action.payload.racer,
                changes: {
                    status: action.payload.status,
                    times: [{time: 0, rank: action.payload.order}],
                    diffs: [[0]]
                }
            }, state);
        }

        case RaceActions.SET_START_TIME: {
            const times = state.entities[action.payload.racer].times.slice();
            times[0] = Object.assign({}, times[0], {time: action.payload.time});

            const diffs = [[action.payload.time]].concat(updateDiffs(times, 0));
            return adapter.updateOne({id: action.payload.racer, changes: {times, diffs}}, state);
        }

        case RaceActions.SET_STATUS: {
            return {
                ...adapter.updateOne({
                id: action.payload.id,
                changes: {
                    status: action.payload.status
                }
            }, state), history: [{racer: action.payload.id, inter: 0, update: true}, ...state.history]};
        }

        case RaceActions.REGISTER_RESULT: {
            const inter = state.interMap[action.payload.intermediate];
            const time = action.payload.time || maxVal * 6;
            const racer = action.payload.racer;

            const _times = state.entities[racer].times.slice();
            let _diffs = state.entities[racer].diffs.slice(0, inter + 1);
            const _sortedTimes = state.sortedTimes[inter].slice();

            let changes = [];

            if (_times.length !== inter) {
                if (_times.length < inter) {
                    const t = (time < maxVal) ? maxVal * 6 : time;

                    changes = insertTime(state, _sortedTimes, _times, racer, time, inter);

                    for (let i = 0; i < _times.length; i++) {
                        if (_times[i] === undefined) {
                            _diffs[i] = (new Array(i)).fill(maxVal);
                            _times[i] = {time: t, rank: null};
                        }
                    }
                } else {
                    const previousTime = _times[inter].time;
                    if (previousTime >= maxVal) {
                        changes = insertTime(state, _sortedTimes, _times, racer, time, inter);
                    } else {
                        const length = _sortedTimes.length;
                        let rank = 1;
                        let index;
                        for (let i = 0; i < length; i++) {
                            let _rank = 0;

                            if (racer === _sortedTimes[i].racer) {
                                index = i;
                                continue;
                            }

                            if (time < _sortedTimes[i].time) {
                                _rank += 1;
                            } else if (time > _sortedTimes[i].time) {
                                rank += 1;
                            }

                            if (_sortedTimes[i].time > previousTime) {
                                _rank -= 1;
                            }

                            if (_rank !== 0) {
                                const timeRow = [...state.entities[_sortedTimes[i].racer].times];
                                timeRow[inter] = {time: _sortedTimes[i].time, rank: timeRow[inter].rank + _rank};
                                changes.push({
                                    id: _sortedTimes[i].racer,
                                    changes: {times: timeRow}
                                });
                            }
                        }

                        _sortedTimes.splice(index, 1);
                        if (time > maxVal) {
                            rank = null;
                        }
                        _times[inter] = {time, rank};
                        if (rank !== null) {
                            _sortedTimes.push({time, racer});
                        }
                    }

                    _diffs = _diffs.concat(updateDiffs(_times, inter));
                }
            } else {
                changes = insertTime(state, _sortedTimes, _times, racer, time, inter);
            }

            const diff = [];
            for (let i = 0; i < inter; i++) {
                diff.push(getValidDiff(time, _times[i].time));
            }
            _diffs[inter] = diff;

            changes.push({
                id: racer,
                changes: {times: _times, diffs: _diffs}
            });

            return {
                ...adapter.updateMany(changes, state),
                sortedTimes: {...state.sortedTimes, [inter]: _sortedTimes},
                history: [{racer, inter}, ...state.history]
            };
        }

        default:
            return state;
    }
}

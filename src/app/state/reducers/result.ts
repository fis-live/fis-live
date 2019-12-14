import { Action, createReducer, createSelector, on } from '@ngrx/store';
import produce from 'immer';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { View } from '../../datagrid/providers/config';
import { maxVal } from '../../fis/fis-constants';
import { Result, Status } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Event, RacerData, Standing } from '../../models/racer';
import { Prop, ResultItem } from '../../models/table';
import { RaceActions } from '../actions';

import { getValidDiff, registerResultMutably, updateResultMutably } from './helpers';

export interface State {
    ids: number[];
    entities: {[id: number]: RacerData};
    intermediates: Intermediate[];
    standings: {[id: number]: Standing};
    events: Event[];
}

export const initialState: State = {
    ids: [],
    entities: {},
    intermediates: [],
    standings: {},
    events: []
};

const resultReducer = createReducer(
    initialState,
    on(RaceActions.initialize, (_, action) => {
        const state: State = {
            ids: [],
            entities: {},
            intermediates: action.intermediates,
            standings: {},
            events: []
        };

        action.intermediates.forEach(intermediate => {
            state.standings[intermediate.key] = {
                version: 0,
                ids: [],
                leader: maxVal,
                bestDiff: (new Array(Math.max(intermediate.key, 1))).fill(maxVal)
            };
        });

        for (const racer of action.racers) {
            state.ids.push(racer.bib);
            const entry = action.startList[racer.bib];
            if (entry != null) {
                state.standings[0].ids.push(racer.bib);
                state.entities[racer.bib] = {
                    id: racer.bib,
                    status: entry.status || '',
                    racer: racer,
                    marks: [{time: 0, status: entry.status || '', rank: entry.order || null, diffs: [maxVal]}],
                    notes: []
                };
            } else {
                state.entities[racer.bib] = {
                    id: racer.bib,
                    status: '',
                    racer: racer,
                    marks: [],
                    notes: []
                };
            }
        }

        for (const result of action.results) {
            const inter = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
            const time = result.time || maxVal * 6;
            const racer = result.racer;
            const isBonus = state.intermediates[inter].type === 'bonus_points';
            if (state.entities[racer].marks.length > inter) {
                updateResultMutably(state, racer, time, inter, isBonus);
            } else {
                registerResultMutably(state, state, racer, time, inter, isBonus);
            }
        }

        return state;
    }),
    on(RaceActions.setPursuitTimes, (state, { times }) => produce(state, draft => {
        let leader = maxVal;
        const bestDiffs: number[] = [];
        for (const time of times) {
            const marks = draft.entities[time.racer].marks;
            marks[0].time = time.time;
            marks[0].diffs = [time.time];
            leader = Math.min(leader, time.time);
            const l = state.entities[time.racer].marks.length;
            for (let i = 1; i < l; i++) {
                const t = getValidDiff(marks[i].time, time.time);
                marks[i].diffs[0] = t;
                bestDiffs[i] = Math.min(bestDiffs[i] || maxVal, t);
            }
        }

        for (let i = 1; i < state.intermediates.length; i++) {
            if (bestDiffs[i] !== undefined) {
                draft.standings[i].bestDiff[0] = bestDiffs[i];
                draft.standings[i].version += 1;
            }
        }
        const standing = draft.standings[0];
        standing.version += 1;
        standing.leader = leader;
        standing.bestDiff = [leader];
    })),
    on(RaceActions.update, (state, action) => produce(state, draft => {
        const { timestamp, isEvent } = action;

        for (const event of action.events) {
            switch (event.type) {
                case 'register_result': {
                    const result = event.payload as Result;
                    const inter = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
                    const time = result.time || maxVal * 6;
                    const racer = result.racer;
                    const isBonus = state.intermediates[inter].type === 'bonus_points';

                    const _event = {
                        racer: state.entities[racer].racer.firstName[0] + '. ' + state.entities[racer].racer.lastName,
                        inter: state.intermediates[inter].name,
                        status: '',
                        rank: 0,
                        diff: formatTime(time, state.standings[inter].leader),
                        timestamp: timestamp,
                        interId: inter
                    };

                    if (state.entities[racer].marks.length > inter) {
                        updateResultMutably(draft, racer, time, inter, isBonus);
                    } else {
                        registerResultMutably(state, draft, racer, time, inter, isBonus);
                    }

                    if (!isBonus && isEvent && time < maxVal) {
                        draft.events = [...draft.events.slice(Math.max(draft.events.length - 30, 0)), _event];
                    }
                }
                break;
                case 'set_status':
                    const e = event.payload as Status;
                    draft.entities[e.id].status = e.status;
                    draft.standings[0].version += 1;
                    break;
            }
        }
    }))
);

export function reducer(state: State | undefined, action: Action) {
    return resultReducer(state, action);
}

export const getEvents = (state: State) => state.events;

export const getIntermediates = (state: State) => state.intermediates;

export const getRacerIds = (state: State) => state.ids;

export const getRacerEntities = (state: State) => state.entities;

export const getAllRacers = createSelector(
    getRacerIds,
    getRacerEntities,
    (ids, entities) => {
        const racers = [];
        for (const id of ids) {
            racers.push(entities[id].racer);
        }

        return racers;
    }
);

const formatTime = (value: number | string, zero: number | null): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (value == null) {
        return '';
    }

    if (zero === null) {
        zero = value;
    }

    let timeStr = (value === zero) ? '' : (value < zero ? '-' : '+');
    const time = (value === zero) ? value : (value < zero ? zero - value : value - zero);

    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time - hours * 1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
    const tenths = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000) / 100);
    const hundreds = Math.floor((time - hours * 1000 * 60 * 60 - minutes * 1000 * 60 - seconds * 1000 - tenths * 100) / 10);

    if (hours > 0 || minutes > 0) {
        if (hours > 0) {
            timeStr += hours + ':';
            if (minutes < 10) {
                timeStr += '0';
            }
        }
        timeStr += minutes + ':';
        if (seconds < 10) {
            timeStr += '0';
        }
    }

    timeStr += seconds + '.' + tenths;
    timeStr += (hundreds > 0) ? hundreds : '';

    return timeStr;
};

export const createViewSelector = (view: View): OperatorFunction<State, ResultItem[]> => {
    let version: number;
    return pipe(
        filter((state) => {
            const inter = view.inter ? view.inter.key : null;
            return view.mode === 'analysis' || (
                inter === null ||
                state.standings[inter] === undefined ||
                state.standings[inter].version !== version
            );
        }),
        map((state: State) => {
            if (view.mode === 'normal') {
                if (view.inter === null || state.standings[view.inter.key] === undefined) {
                    version = 0;
                    return [];
                }

                version = state.standings[view.inter.key].version;
                const rows = [];
                const length = state.standings[view.inter.key].ids.length;
                for (let i = 0; i < length; i++) {
                    const id = state.standings[view.inter.key].ids[i];
                    const row = state.entities[id];
                    const time = row.marks[view.inter.key].time;
                    const _state = row.marks[view.inter.key].rank !== null && view.inter.key !== 0 && length - i < 4 ? 'new' : 'normal';

                    let timeProp: Prop<number> | Prop<string>;
                    if (view.inter.type === 'bonus_points') {
                        if (time < maxVal) {
                            timeProp = {
                                value: time,
                                display: time
                            };
                        } else {
                            continue;
                        }
                    } else {
                        timeProp = view.inter.key === 0 ? {display: row.status, value: row.status} : {
                            display: time < maxVal ?
                                formatTime(time, state.standings[view.inter.key].leader) : row.marks[view.inter.key].status,
                            value: time
                        };
                    }

                    let diff: Prop<number>;
                    if (view.diff !== null) {
                        const temp = row.marks[view.inter.key].diffs[view.diff.key];
                        const d = temp === null ? maxVal : temp;
                        console.log(view, temp, state.standings[view.inter.key].bestDiff[view.diff.key]);

                        diff = {
                            display: d < maxVal ? formatTime(d, state.standings[view.inter.key].bestDiff[view.diff.key]) : '',
                            value: d
                        };
                    } else {
                        diff = {
                            display: '',
                            value: maxVal
                        };
                    }

                    const classes = [row.racer.nsa.toLowerCase(), _state];
                    if (row.marks[view.inter.key].rank === 1 && view.inter.key > 0) {
                        classes.push('leader');
                    } else if (row.marks[view.inter.key].rank == null) {
                        classes.push('disabled');
                    }

                    if (row.racer.isFavorite) {
                        classes.push('favorite');
                    }

                    if (row.racer.color) {
                        classes.push(row.racer.color);
                    }

                    rows.push({
                        state: _state,
                        id: row.racer.id,
                        bib: row.racer.bib,
                        nsa: row.racer.nsa,
                        time: timeProp,
                        rank: row.marks[view.inter.key].rank,
                        diff: diff,
                        name: {
                            display: row.racer.firstName + ' ' + row.racer.lastName,
                            value: (row.racer.lastName + ', ' + row.racer.firstName).toLowerCase()
                        },
                        notes: row.notes,
                        classes: classes,
                        marks: []
                    });
                }
                return rows;
            } else {
                const zeroes: (number | null)[] = [];
                if (view.zero === -1) {
                    for (const { key } of state.intermediates) {
                        if (view.display === 'total') {
                            zeroes[key] = state.standings[key].leader;
                        } else {
                            const prevKey = key > 0 && state.intermediates[key - 1].type === 'bonus_points' ? key - 2 : key - 1;
                            zeroes[key] = key > 0 ? state.standings[key].bestDiff[prevKey] : 0;
                        }
                    }
                } else {
                    for (const { key } of state.intermediates) {
                        if (state.entities[view.zero].marks[key] !== undefined) {
                            if (view.display === 'total') {
                                zeroes[key] = state.entities[view.zero].marks[key].time;
                            } else {
                                const prevKey = key > 0 && state.intermediates[key - 1].type === 'bonus_points' ? key - 2 : key - 1;
                                zeroes[key] = key > 0 ? state.entities[view.zero].marks[key].diffs[prevKey] : 0;
                            }
                        } else {
                            zeroes[key] = null;
                        }
                    }
                }

                if (view.inter === null || state.standings[view.inter.key] === undefined) {
                    version = 0;
                    return [];
                }

                const rows = [];
                const length = state.ids.length;
                for (const id of state.ids) {
                    const row = state.entities[id];
                    const _state = 'normal';
                    const classes: string[] = [row.racer.nsa.toLowerCase(), 'analysis'];

                    if (row.racer.isFavorite) {
                        classes.push('favorite');
                    }

                    if (row.racer.color) {
                        classes.push(row.racer.color);
                    }

                    const marks: (Prop<number> | Prop<string>)[] = [];

                    for (const { key } of state.intermediates) {
                        let time: number | null;
                        if (view.display === 'total') {
                            time = row.marks[key] != null ? row.marks[key].time : null;
                        } else {
                            const prevKey = key > 0 && state.intermediates[key - 1].type === 'bonus_points' ? key - 2 : key - 1;
                            time =  row.marks[key] != null ?
                                (key === 0 ? row.marks[0].diffs[0] : row.marks[key].diffs[prevKey]) : null;
                        }

                        const display = (time !== null) ?  (time < maxVal ? formatTime(time, zeroes[key]) : row.marks[key].status) : '';
                        const value = (time !== null) ?  time : maxVal * 6;

                        marks[key] = {
                            display,
                            value
                        };
                    }

                    rows.push({
                        state: _state,
                        id: row.racer.id,
                        bib: row.racer.bib,
                        nsa: row.racer.nsa,
                        time: {display: '', value: 0},
                        rank: 1,
                        diff: {display: '', value: 0},
                        name: {
                            display: row.racer.firstName + ' ' + row.racer.lastName,
                            value: (row.racer.lastName + ', ' + row.racer.firstName).toLowerCase()
                        },
                        notes: row.notes,
                        classes: classes,
                        marks: marks
                    });
                }

                return rows;
            }
        })
    );
};

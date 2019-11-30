import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, createSelector, on, select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { View } from '../../components/datagrid/providers/config';
import { maxVal } from '../../fis/fis-constants';
import { Intermediate } from '../../models/intermediate';
import { Event, Prop, RacerData, Standing } from '../../models/racer';
import { ResultItem } from '../../models/table';
import { RaceActions } from '../actions';

import { getValidDiff, registerResult, updateResult } from './helpers';

export interface State extends EntityState<RacerData> {
    intermediates: Intermediate[];
    standings: {[id: number]: Standing};
    events: Event[];
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({intermediates: [], standings: {}, events: []});

const resultReducer = createReducer(
    initialState,
    on(RaceActions.addIntermediate, (state, { intermediate }) => ({
        ...state,
        intermediates: [...state.intermediates, intermediate],
        standings: {
            ...state.standings,
            [intermediate.key]: {version: 0, ids: [], leader: maxVal, bestDiff: (new Array(intermediate.key)).fill(maxVal)}
        }
    })),
    on(RaceActions.addRacer, (state, { racer }) => adapter.addOne({
        id: racer.bib,
        status: '',
        racer: racer,
        results: [{time: 0, status: '', rank: null, diffs: [0]}],
        notes: []
    }, state)),
    on(RaceActions.addNote, (state, { note }) => adapter.updateOne({
        id: note.racer,
        changes: {
            notes: [...state.entities[note.racer]!.notes, 'W']
        }
    }, state)),
    on(RaceActions.addStartList, (state, { entry }) => {
        const standings = {...state.standings[0]};
        standings.ids = standings.ids.concat(entry.racer);
        standings.version += 1;
        return {...adapter.updateOne({
                id: entry.racer,
                changes: {
                    status: entry.status,
                    results: [{time: 0, status: entry.status, rank: entry.order, diffs: [0]}]
                }
            }, state),
            standings: {...state.standings, [0]: standings}};
    }),
    on(RaceActions.setStartTime, (state, { time }) => {
        const results = [...state.entities[time.racer]!.results];
        results[0] = {...results[0], time: time.time, diffs: [time.time]};

        const standings: {[id: number]: Standing} = {[0]: {...state.standings[0]}};
        standings[0].version += 1;
        standings[0].leader = time.time < standings[0].leader ? time.time : standings[0].leader;
        standings[0].bestDiff = [standings[0].leader];

        for (let i = 1; i < results.length; i++) {
            const diffs = [...results[i].diffs];
            diffs[0] = getValidDiff(results[i].time, time.time);
            if (diffs[0] < state.standings[i].bestDiff[0]) {
                standings[i] = {
                    ...state.standings[i],
                    version: state.standings[i].version + 1,
                    bestDiff: [diffs[0], ...state.standings[i].bestDiff.slice(1)]
                };
            } else {
                standings[i] = {
                    ...state.standings[i],
                    version: state.standings[i].version + 1
                };
            }

            results[i] = {...results[i], diffs};
        }

        return {
            ...adapter.updateOne({id: time.racer, changes: {results: results}}, state),
            standings: {...state.standings, ...standings}
        };
    }),
    on(RaceActions.setStatus, (state, { status }) => {
        return {
            ...adapter.updateOne({id: status.id, changes: {status: status.status}}, state),
            standings: {...state.standings, [0]: {...state.standings[0], version: state.standings[0].version + 1}}
        };
    }),
    on(RaceActions.registerResult, (state, { result, timestamp, isEvent }) => {
        const inter = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
        const time = result.time || maxVal * 6;
        const racer = result.racer;

        let changes;
        const event = {
            racer: state.entities[racer]!.racer.firstName[0] + '. ' + state.entities[racer]!.racer.lastName,
            inter: state.intermediates[inter].name,
            status: '',
            rank: 0,
            diff: formatTime(time, state.standings[inter].leader),
            timestamp: timestamp,
            interId: inter
        };

        if (state.entities[racer]!.results.length > inter) {
            changes = updateResult(state, racer, time, inter);
        } else {
            changes = registerResult(state, racer, time, inter);
        }

        let events = [...state.events];

        if (isEvent && time < maxVal) {
            events = [...events.slice(Math.max(events.length - 30, 0)), event];
        }

        return {
            ...adapter.updateMany(changes.changes, state),
            standings: {...state.standings, ...changes.standings},
            events: events
        };
    })
);

export function reducer(state: State | undefined, action: Action) {
    return resultReducer(state, action);
}

export const getRacerIds = (state: State) => state.ids;

export const getRacerEntities = (state: State) => state.entities;

export const getAllRacers = createSelector(
    getRacerIds,
    getRacerEntities,
    (ids, entities) => {
        const racers = [];
        for (const id of ids) {
            racers.push(entities[id]!.racer);
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

export const getEvents = (state: State) => state.events;

export const getIntermediates = (state: State) => state.intermediates;

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
                    const row = state.entities[id]!;
                    const time = row.results[view.inter.key].time;
                    const _state = row.results[view.inter.key].rank !== null && view.inter.key !== 0 && length - i < 4 ? 'new' : 'normal';

                    let diff: Prop<number>;
                    if (view.diff !== null) {
                        const temp = row.results[view.inter.key].diffs[view.diff.key];
                        const d = temp === null ? maxVal : temp;

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

                    const classes = [row.racer.nationality.toLowerCase(), _state];
                    if (row.results[view.inter.key].rank === 1 && view.inter.key > 0) {
                        classes.push('leader');
                    } else if (row.results[view.inter.key].rank == null) {
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
                        nationality: row.racer.nationality,
                        time: view.inter.key === 0 ? {display: row.status, value: row.status} : {
                            display: time < maxVal ?
                                formatTime(time, state.standings[view.inter.key].leader) : row.results[view.inter.key].status,
                            value: time
                        },
                        rank: row.results[view.inter.key].rank,
                        diff: diff,
                        name: {
                            display: row.racer.firstName + ' ' + row.racer.lastName,
                            value: row.racer.lastName + ', ' + row.racer.firstName
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
                            zeroes[key] = key > 0 ? state.standings[key].bestDiff[key - 1] : 0;
                        }
                    }
                } else {
                    for (const { key } of state.intermediates) {
                        if (state.entities[view.zero]!.results[key] !== undefined) {
                            if (view.display === 'total') {
                                zeroes[key] = state.entities[view.zero]!.results[key].time;
                            } else {
                                zeroes[key] = key > 0 ? state.entities[view.zero]!.results[key].diffs[key - 1] : 0;
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
                    const row = state.entities[id]!;
                    const _state = 'normal';
                    const classes: string[] = [row.racer.nationality.toLowerCase(), 'analysis'];

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
                            time = row.results[key] != null ? row.results[key].time : null;
                        } else {
                            time =  row.results[key] != null ?
                                (key === 0 ? row.results[0].diffs[0] : row.results[key].diffs[key - 1]) : null;
                        }

                        const display = (time !== null) ?  (time < maxVal ? formatTime(time, zeroes[key]) : row.results[key].status) : '';
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
                        nationality: row.racer.nationality,
                        time: {display: '', value: 0},
                        rank: 1,
                        diff: {display: '', value: 0},
                        name: {
                            display: row.racer.firstName + ' ' + row.racer.lastName,
                            value: row.racer.lastName + ', ' + row.racer.firstName
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

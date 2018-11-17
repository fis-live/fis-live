import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { maxVal } from '../../fis/fis-constants';
import { Intermediate } from '../../models/intermediate';
import { Event, Prop, RacerData, Standing } from '../../models/racer';
import { ResultItem } from '../../models/table';
import { RaceAction, RaceActionTypes } from '../actions/race';

import { getValidDiff, registerResult, updateResult } from './helpers';
import { AppState, getResultState } from './index';

export interface State extends EntityState<RacerData> {
    intermediates: Intermediate[];
    standings: {[id: number]: Standing};
    events: Event[];
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({intermediates: [], standings: {}, events: []});

export function reducer(state: State = initialState, action: RaceAction): State {
    switch (action.type) {
        case RaceActionTypes.AddIntermediate: {
            return {
                ...state,
                intermediates: [...state.intermediates, action.payload],
                standings: {
                    ...state.standings,
                    [action.payload.key]: {version: 0, ids: [], leader: maxVal, bestDiff: (new Array(action.payload.key)).fill(maxVal)}
                }
            };
        }

        case RaceActionTypes.AddRacer: {
            return adapter.addOne({
                id: action.payload.bib,
                status: '',
                racer: action.payload,
                results: [{time: 0, status: '', rank: null, diffs: [0]}],
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
            const standings = {...state.standings[0]};
            standings.ids = standings.ids.concat(action.payload.racer);
            standings.version += 1;
            return {...adapter.updateOne({
                id: action.payload.racer,
                changes: {
                    status: action.payload.status,
                    results: [{time: 0, status: action.payload.status, rank: action.payload.order, diffs: [0]}]
                }
            }, state),
                standings: {...state.standings, [0]: standings}};
        }

        case RaceActionTypes.SetStartTime: {
            const results = [...state.entities[action.payload.racer].results];
            results[0] = {...results[0], time: action.payload.time, diffs: [action.payload.time]};

            const standings: {[id: number]: Standing} = {[0]: {...state.standings[0]}};
            standings[0].version += 1;
            standings[0].leader = action.payload.time < standings[0].leader ? action.payload.time : standings[0].leader;
            standings[0].bestDiff = [standings[0].leader];

            for (let i = 1; i < results.length; i++) {
                const diffs = [...results[i].diffs];
                diffs[0] = getValidDiff(results[i].time, action.payload.time);
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
                ...adapter.updateOne({id: action.payload.racer, changes: {results: results}}, state),
                standings: {...state.standings, ...standings}
            };
        }

        case RaceActionTypes.SetStatus: {
            return {
                ...adapter.updateOne({id: action.payload.id, changes: {status: action.payload.status}}, state),
                standings: {...state.standings, [0]: {...state.standings[0], version: state.standings[0].version + 1}}
            };
        }

        case RaceActionTypes.RegisterResult: {
            const inter = action.payload.intermediate === 99 ? state.intermediates.length - 1 : action.payload.intermediate;
            const time = action.payload.time || maxVal * 6;
            const racer = action.payload.racer;

            let changes;
            const event = {
                racer: state.entities[racer].racer.firstName[0] + '. ' + state.entities[racer].racer.lastName,
                inter: state.intermediates[inter].name,
                status: '',
                rank: 0,
                diff: formatTime(time, state.standings[inter].leader),
                timestamp: action.timestamp
            };

            if (state.entities[racer].results.length > inter) {
                changes = updateResult(state, racer, time, inter);
            } else {
                changes = registerResult(state, racer, time, inter);
            }

            let events = [...state.events];

            if (action.isEvent && time < maxVal) {
                events = [...events.slice(Math.max(events.length - 10, 0)), event];
            }

            return {
                ...adapter.updateMany(changes.changes, state),
                standings: {...state.standings, ...changes.standings},
                events: events
            };
        }

        default:
            return state;
    }
}

const formatTime = (value: number | string, zero: number): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (value == null) {
        return '';
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

export const createViewSelector = (view: {inter: number | null, diff: number | null}): OperatorFunction<AppState, ResultItem[]> => {
    let version: number;
    return pipe(
        select(getResultState),
        filter((state) => view.inter === null || state.standings[view.inter] === undefined
            || state.standings[view.inter].version !== version),
        map((state: State) => {
            if (view.inter === null || state.standings[view.inter] === undefined) {
                version = 0;
                return [];
            }

            version = state.standings[view.inter].version;
            const rows = [];
            const length = state.standings[view.inter].ids.length;
            for (let i = 0; i < length; i++) {
                const id = state.standings[view.inter].ids[i];
                const row = state.entities[id];
                const time = row.results[view.inter].time;
                const _state = row.results[view.inter].rank !== null && view.inter !== 0 && length - i < 4 ? 'new' : 'normal';

                let diff: Prop<number>;
                if (view.diff !== null) {
                    const d = row.results[view.inter].diffs[view.diff] || maxVal;

                    diff = {
                        display: d < maxVal ? formatTime(d, state.standings[view.inter].bestDiff[view.diff]) : '',
                        value: d
                    };
                } else {
                    diff = {
                        display: '',
                        value: maxVal
                    };
                }

                const classes = [row.racer.nationality.toLowerCase(), _state];
                if (row.results[view.inter].rank === 1 && view.inter > 0) {
                    classes.push('leader');
                } else if (row.results[view.inter].rank == null) {
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
                    time: view.inter === 0 ? {display: row.status, value: row.status} : {
                        display: time < maxVal ? formatTime(time, state.standings[view.inter].leader) : row.results[view.inter].status,
                        value: time
                    },
                    rank: row.results[view.inter].rank,
                    diff: diff,
                    name: {
                        display: row.racer.firstName + ' ' + row.racer.lastName,
                        value: row.racer.lastName + ', ' + row.racer.firstName
                    },
                    notes: row.notes,
                    classes: classes
                });
            }
            return rows;
        })
    );
};

import { Action, createReducer, createSelector, on } from '@ngrx/store';
import produce from 'immer';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { View } from '../../datagrid/providers/config';
import { isRanked, maxVal, Status as StatusEnum, timePenalty } from '../../fis/fis-constants';
import { Result, Status } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Event, RacerData, Standing } from '../../models/racer';
import { Prop, ResultItem } from '../../models/table';
import { formatTime, guid } from '../../utils/utils';
import { RaceActions } from '../actions';

import { getValidDiff, registerResultMutably, updateResultMutably } from './helpers';

export interface State {
    id: string;
    ids: number[];
    entities: {[id: number]: RacerData};
    intermediates: Intermediate[];
    standings: {[id: number]: Standing};
}

export const initialState: State = {
    id: '',
    ids: [],
    entities: {},
    intermediates: [],
    standings: {}
};

const resultReducer = createReducer(
    initialState,
    on(RaceActions.initialize, (_, action) => {
        const state: State = {
            id: guid(),
            ids: [],
            entities: {},
            intermediates: action.intermediates,
            standings: {}
        };

        action.intermediates.forEach(intermediate => {
            state.standings[intermediate.key] = {
                version: 0,
                ids: [],
                leader: maxVal,
                latestBibs: [],
                bestDiff: (new Array(Math.max(intermediate.key, 1))).fill(maxVal),
                events: []
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
                    marks: [{time: 0, status: StatusEnum.Default, rank: entry.order || null, diffs: [maxVal], version: 0}],
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
            if (state.entities[result.racer].marks.length > result.intermediate) {
                updateResultMutably(state, result);
            } else {
                registerResultMutably(state, result);
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
                const t = getValidDiff(marks[i], marks[0]);
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
        const { timestamp } = action;

        for (const event of action.events) {
            switch (event.type) {
                case 'register_result': {
                    const result = event.payload as Result;
                    const inter = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
                    const isBonus = state.intermediates[inter].type === 'bonus_points';
                    const leader = draft.standings[inter].leader;

                    if (draft.entities[result.racer].marks.length > inter) {
                        updateResultMutably(draft, result);
                    } else {
                        registerResultMutably(draft, result);

                        const _event = {
                            racer: state.entities[result.racer].racer,
                            rank: draft.entities[result.racer].marks[inter].rank,
                            diff: formatTime(result.time, (leader < maxVal) ? leader : result.time),
                            timestamp: timestamp
                        };

                        if (!isBonus && isRanked(result.status)) {
                            draft.standings[inter].events = [_event, ...draft.standings[inter].events.slice(0, 20)];
                        }
                    }
                }
                break;
                case 'set_status':
                    const e = event.payload as Status;
                    draft.entities[e.id].status = e.status;
                    draft.entities[e.id].marks[0].version += 1;
                    draft.standings[0].version += 1;
                    break;
            }
        }
    }))
);

export function reducer(state: State | undefined, action: Action) {
    return resultReducer(state, action);
}

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

function prepareStartList(state: State): ResultItem[] {
    const standing = state.standings[0];
    const rows = [];
    for (const id of standing.ids) {
        const entity = state.entities[id];
        const mark = entity.marks[0];
        const time = mark.diffs[0];

        const classes = [entity.racer.nsa.toLowerCase(), 'normal'];

        if (entity.racer.isFavorite) {
            classes.push('favorite');
        }

        if (entity.racer.color) {
            classes.push(entity.racer.color);
        }

        rows.push({
            state: 'normal',
            racer: entity.racer,
            time: { display: entity.status, value: entity.status },
            rank: mark.rank,
            diff: {
                display: time < maxVal ? formatTime(time, standing.bestDiff[0]) : '',
                value: time
            },
            notes: entity.notes,
            classes: classes,
            marks: [],
            version: mark.version
        });
    }

    return rows;
}

function prepareInter(state: State, intermediate: Intermediate, diff: number | null): ResultItem[] {
    const standing = state.standings[intermediate.key];

    const rows = [];
    for (const id of standing.ids) {
        const entity = state.entities[id];
        const mark = entity.marks[intermediate.key];
        const time = mark.time;
        const _state = standing.latestBibs.find((bib) => bib === id) ? 'new' : 'normal';

        let timeProp: Prop<number> | Prop<string>;
        if (intermediate.type === 'bonus_points') {
            if (isRanked(mark.status)) {
                timeProp = {
                    value: time,
                    display: time
                };
            } else {
                continue;
            }
        } else {
            timeProp = {
                display: isRanked(mark.status) ? formatTime(time, standing.leader) : mark.status,
                value: time
            };
        }

        let diffProp = {
            display: '',
            value: maxVal
        };

        if (diff !== null) {
            const d = mark.diffs[diff];

            diffProp = {
                display: d < maxVal ? formatTime(d, standing.bestDiff[diff]) : '',
                value: d
            };
        }

        const classes = [entity.racer.nsa.toLowerCase(), _state];
        if (mark.rank === 1) {
            classes.push('leader');
        } else if (mark.rank == null) {
            classes.push('disabled');
        }

        if (entity.racer.isFavorite) {
            classes.push('favorite');
        }

        if (entity.racer.color) {
            classes.push(entity.racer.color);
        }

        rows.push({
            state: _state,
            racer: entity.racer,
            time: timeProp,
            rank: mark.rank,
            diff: diffProp,
            notes: entity.notes,
            classes: classes,
            marks: [],
            version: 0
        });
    }

    return rows;
}

function prepareAnalysis(state: State, view: View): ResultItem[] {
    const zeroes: (number | null)[] = [];
    const previousSector: number[] = [];
    if (view.zero === -1) {
        for (const { key } of state.intermediates) {
            const prevKey = key > 0 && state.intermediates[key - 1].type === 'bonus_points' ? Math.max(key - 2, 0) : Math.max(key - 1, 0);
            previousSector[key] = prevKey;
            if (view.display === 'total') {
                zeroes[key] = state.standings[key].leader;
            } else {
                zeroes[key] = key > 0 ? state.standings[key].bestDiff[prevKey] : 0;
            }
        }
    } else {
        for (const { key } of state.intermediates) {
            const prevKey = key > 0 && state.intermediates[key - 1].type === 'bonus_points' ? Math.max(key - 2, 0) : Math.max(key - 1, 0);
            previousSector[key] = prevKey;
            if (state.entities[view.zero].marks[key] !== undefined) {
                if (view.display === 'total') {
                    zeroes[key] = state.entities[view.zero].marks[key].time;
                } else {
                    zeroes[key] = key > 0 ? state.entities[view.zero].marks[key].diffs[prevKey] : 0;
                }
            } else {
                zeroes[key] = null;
            }
        }
    }

    const rows = [];
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

        const marks: ((Prop<number> | Prop<string>) & { state: string })[] = [];

        for (let i = 0; i < row.marks.length; i++) {
            const prevKey = previousSector[i];
            const mark = row.marks[i];

            if (view.display === 'total') {
                marks[i] = {
                    display: isRanked(mark.status) ? formatTime(mark.time, zeroes[i]) : mark.status,
                    value: mark.time + timePenalty[mark.status],
                    state: state.standings[i].latestBibs.find((bib) => bib === id) ? 'new' : 'normal'
                };
            } else {
                const time =  mark.diffs[prevKey];
                marks[i] = {
                    display: time < maxVal ? formatTime(time, zeroes[i]) : (isRanked(mark.status) ? 'N/A' : mark.status),
                    value: time,
                    state: state.standings[i].latestBibs.find((bib) => bib === id) ? 'new' : 'normal'
                };
            }
        }

        rows.push({
            state: _state,
            racer: row.racer,
            time: {display: '', value: 0},
            rank: 1,
            diff: {display: '', value: 0},
            notes: row.notes,
            classes: classes,
            marks: marks,
            version: 0
        });
    }

    return rows;
}

export const createViewSelector = (view: View): OperatorFunction<State, ResultItem[]> => {
    let version: number;
    let id: string;
    return pipe(
        filter((state) => {
            const b1 = id !== state.id;
            const b2 = view.mode === 'analysis';
            const inter = view.inter ? view.inter.key : null;
            const b3 = inter === null || state.standings[inter] === undefined || state.standings[inter].version !== version;

            return b1 || b2 || b3;
        }),
        map((state: State) => {
            id = state.id;

            if (view.mode === 'normal') {
                if (view.inter === null || state.standings[view.inter.key] === undefined) {
                    version = 0;
                    return [];
                }

                version = state.standings[view.inter.key].version;
                if (view.inter.id === 0) {
                    return prepareStartList(state);
                }

                return prepareInter(state, view.inter, view.diff ? view.diff.key : null);
            } else {
                return prepareAnalysis(state, view);
            }
        })
    );
};

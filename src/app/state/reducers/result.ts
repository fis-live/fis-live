import { Action, createReducer, createSelector, on } from '@ngrx/store';
import produce from 'immer';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Prop, ResultItem, View } from '../../datagrid/state/model';
import { isRanked, maxVal, Status as StatusEnum, timePenalty } from '../../fis/fis-constants';
import { Result, Status } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { RacerData, Standing } from '../../models/racer';
import { formatTime, getValidDiff, guid, isBonus, parseTimeString } from '../../utils/utils';
import { RaceActions } from '../actions';

import { registerResultMutably, updateResultMutably } from './helpers';

export interface State {
    id: string;
    ids: number[];
    entities: {[id: number]: RacerData};
    intermediates: Intermediate[];
    interById: {[id: number]: number };
    standings: {[id: number]: Standing};
}

export const initialState: State = {
    id: '',
    ids: [],
    entities: {},
    intermediates: [],
    standings: {},
    interById: {}
};

const resultReducer = createReducer(
    initialState,
    on(RaceActions.initialize, (_, { intermediates, racers, results, startList }) => {
        const state: State = {
            id: guid(),
            ids: [],
            entities: {},
            intermediates: intermediates,
            interById: {},
            standings: {}
        };

        intermediates.forEach(intermediate => {
            state.interById[intermediate.id] = intermediate.key;
            state.standings[intermediate.key] = {
                version: 0,
                ids: [],
                leader: maxVal,
                latestBibs: [],
                bestDiff: (new Array(Math.max(intermediate.key, 1))).fill(maxVal),
                tourLeader: maxVal,
                events: []
            };
        });

        for (const racer of racers) {
            state.ids.push(racer.bib);
            const entry = startList[racer.bib];
            if (entry != null) {
                state.standings[0].ids.push(racer.bib);
                state.entities[racer.bib] = {
                    id: racer.bib,
                    status: entry.status || '',
                    racer: racer,
                    marks: [
                        {time: 0, status: StatusEnum.Default, rank: entry.order || null, diffs: [maxVal], version: 0, tourStanding: maxVal}
                        ],
                    notes: [],
                    bonusSeconds: 0
                };
            } else {
                state.entities[racer.bib] = {
                    id: racer.bib,
                    status: '',
                    racer: racer,
                    marks: [],
                    notes: [],
                    bonusSeconds: 0
                };
            }
        }

        for (const result of results) {
            const inter = state.interById[result.intermediate];
            if (state.entities[result.racer].marks.length > inter) {
                updateResultMutably(state, result);
            } else {
                registerResultMutably(state, result);
            }
        }

        return state;
    }),
    on(RaceActions.parsePdf, (state, { racers }) => produce(state, draft => {
        let leader = maxVal;
        let tourLeader = maxVal;
        const bestDiffs: number[] = [];
        const bestTour: number[] = [];

        for (const data of racers) {
            if (data.time !== null) {
                leader = Math.min(leader, data.time);
            }

            if (data.tourStanding !== null) {
                if (data.tourStanding[0] !== '+') {
                    tourLeader = Math.min(tourLeader, parseTimeString(data.tourStanding));
                    bestTour[0] = tourLeader;
                }
            }
        }

        for (const data of racers) {
            const marks = draft.entities[data.bib].marks;
            if (data.isWave) {
                draft.entities[data.bib].notes.push('W');
            }

            if (data.time !== null) {
                marks[0].time = data.time;
                marks[0].diffs = [data.time];

                const l = state.entities[data.bib].marks.length;
                for (let i = 1; i < l; i++) {
                    if (!isBonus(state.intermediates[i])) {
                        const t = getValidDiff(marks[i], marks[0]);
                        marks[i].diffs[0] = t;
                        bestDiffs[i] = Math.min(bestDiffs[i] || maxVal, t);
                    }
                }
            }

            if (data.tourStanding !== null) {
                const entity = draft.entities[data.bib];
                if (data.tourStanding[0] !== '+') {
                    entity.marks[0].tourStanding = parseTimeString(data.tourStanding);
                } else {
                    entity.marks[0].tourStanding = tourLeader + parseTimeString(data.tourStanding);
                }

                for (let i = 1; i < entity.marks.length; i++) {
                    entity.marks[i].tourStanding =
                        (entity.marks[i].diffs[0] < maxVal) ? entity.marks[0].tourStanding + entity.marks[i].diffs[0] - entity.bonusSeconds
                            : maxVal;
                    bestTour[i] = Math.min(bestTour[i] || maxVal, entity.marks[i].tourStanding!);
                }
            }
        }

        if (tourLeader < maxVal) {
            for (const inter of state.intermediates) {
                draft.standings[inter.key].version += 1;
                draft.standings[inter.key].tourLeader = bestTour[inter.key] ?? maxVal;
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
    on(RaceActions.update, (state, { events, timestamp}) => produce(state, draft => {
        for (const event of events) {
            switch (event.type) {
                case 'register_result': {
                    const result = event.payload as Result;
                    const inter = state.interById[result.intermediate];
                    const leader = draft.standings[inter].leader;

                    if (draft.entities[result.racer].marks.length > inter) {
                        updateResultMutably(draft, result);
                    } else if (result.time > 0 || result.status !== StatusEnum.Default) {
                        registerResultMutably(draft, result);

                        const _event = {
                            racer: state.entities[result.racer].racer,
                            rank: draft.entities[result.racer].marks[inter].rank,
                            diff: formatTime(result.time, leader),
                            timestamp: timestamp
                        };

                        if (!isBonus(state.intermediates[inter]) && isRanked(result.status)) {
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
    const bestTourStanding = standing.tourLeader ?? maxVal;

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
                display: formatTime(time, standing.bestDiff[0]),
                value: time
            },
            tourStanding: {
                display: formatTime(mark.tourStanding, bestTourStanding),
                value: mark.tourStanding
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
    const bestTourStanding = standing.tourLeader;

    const rows = [];
    for (const id of standing.ids) {
        const entity = state.entities[id];
        const mark = entity.marks[intermediate.key];
        const time = mark.time;
        const _state = standing.latestBibs.find((bib) => bib === id) ? 'new' : 'normal';

        let timeProp: Prop<number> | Prop<string>;
        let tourStandingProp: Prop<number>;
        if (isBonus(intermediate)) {
            if (isRanked(mark.status)) {
                timeProp = {
                    value: time,
                    display: intermediate.type === 'bonus_time' ? time / 1000 : time
                };

                tourStandingProp = {
                    display: '',
                    value: 0
                };
            } else {
                continue;
            }
        } else {
            timeProp = {
                display: isRanked(mark.status) ? formatTime(time, standing.leader) : mark.status,
                value: time + timePenalty[mark.status]
            };

            const bonusString = entity.bonusSeconds > 0 ? ' [' + entity.bonusSeconds / 1000 + 's]' : '';

            tourStandingProp = {
                value: mark.tourStanding,
                display: formatTime(mark.tourStanding, bestTourStanding) + bonusString
            };
        }

        let diffProp = {
            display: '',
            value: maxVal
        };

        if (diff !== null) {
            const d = mark.diffs[diff];

            diffProp = {
                display: formatTime(d, standing.bestDiff[diff]),
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
            tourStanding: tourStandingProp,
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

    for (const { key } of state.intermediates) {
        const prevKey = isBonus(state.intermediates[key - 1]) ? Math.max(key - 2, 0) : Math.max(key - 1, 0);
        previousSector[key] = prevKey;
        let zero: number;
        if (view.display === 'total') {
            zero = (view.zero === -1) ? state.standings[key].leader : (state.entities[view.zero].marks[key]?.time ?? null);
        } else {
            zero = (view.zero === -1) ?
                state.standings[key].bestDiff[prevKey] : (state.entities[view.zero].marks[key]?.diffs[prevKey] ?? null);
        }
        zeroes[key] = zero < maxVal ? zero : null;
    }

    const finishKey = state.intermediates.length - 1;
    const bestTourStanding = view.zero !== -1 ?
        state.entities[view.zero].marks[finishKey]?.tourStanding ?? state.standings[finishKey].tourLeader
        : state.standings[finishKey].tourLeader;

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
        let tourStandingProp = {
            value: maxVal,
            display: ''
        };

        if (row.marks[finishKey] != null) {
            const mark = row.marks[finishKey];
            const bonusString = row.bonusSeconds > 0 ? ' [' + row.bonusSeconds / 1000 + 's]' : '';
            tourStandingProp = {
                value: mark.tourStanding,
                display: formatTime(mark.tourStanding, bestTourStanding) + bonusString
            };
        }

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
            tourStanding: tourStandingProp,
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
            const b3 = view.inter?.key === undefined || state.standings[view.inter.key]?.version !== version;

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

                return prepareInter(state, view.inter, view.diff?.key ?? null);
            } else {
                return prepareAnalysis(state, view);
            }
        })
    );
};

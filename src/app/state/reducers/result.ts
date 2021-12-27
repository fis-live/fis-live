import { Action, createReducer, createSelector, on } from '@ngrx/store';
import produce from 'immer';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Prop, ResultItem, View } from '../../datagrid/state/model';
import { initializeState } from '../../fis/cross-country/initialize';
import { Intermediate, State } from '../../fis/cross-country/models';
import { handleUpdate, registerResult } from '../../fis/cross-country/state';
import { isBonus, isRanked, maxVal, Status, timePenalty } from '../../fis/fis-constants';
import { formatTime, parseTimeString } from '../../utils/utils';
import { RaceActions, SettingsActions } from '../actions';

export const initialState: State = {
    id: '',
    ids: [],
    entities: {},
    intermediates: [],
    standings: {},
    interById: {},
    precision: -1,
    runs: [],
    activeRun: 0,
    activeHeat: null
};

const resultReducer = createReducer(
    initialState,
    on(RaceActions.initialize, (_, { main }) => initializeState(main)),
    on(RaceActions.parsePdf, (state, { racers }) => produce(state, draft => {
        let tourLeader = maxVal;
        const bestTour: number[] = [];

        for (const data of racers) {
            if (data.tourStanding != null) {
                if (data.tourStanding[0] !== '+') {
                    tourLeader = Math.min(tourLeader, parseTimeString(data.tourStanding));
                    bestTour[0] = tourLeader;
                }
            }
        }

        for (const data of racers) {
            if (data.isWave) {
                draft.entities[data.bib].notes.push('W');
                for (let i = 0; i < state.intermediates.length; i++) {
                    draft.standings[i].version += 1;
                }
            }

            if (data.time != null) {
                registerResult(draft, draft.entities[data.bib], Status.Default, data.time, 0, [1, null]);
            }

            if (data.tourStanding != null) {
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
    })),
    on(RaceActions.update, (state, { events, timestamp }) => produce(state, draft => {
        handleUpdate(draft, events, timestamp);
    })),
    on(SettingsActions.toggleFavorite, (state, { racer }) => produce(state, draft => {
        for (const id of state.ids) {
            if (state.entities[id].racer.id === racer.id) {
                draft.entities[id].racer.isFavorite = !state.entities[id].racer.isFavorite;
                for (let i = 0; i < state.entities[id].marks.length; i++) {
                    draft.standings[i].version += 1;
                }
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
            time: { display: entity.status || entity.startTime || '', value: entity.status, leader: false },
            rank: entity.order,
            diff: {
                display: formatTime(time, standing.bestDiff[0], state.precision),
                value: time,
                leader: time === standing.bestDiff[0]
            },
            tourStanding: {
                display: formatTime(mark.tourStanding, bestTourStanding, state.precision),
                value: mark.tourStanding,
                leader: mark.tourStanding === bestTourStanding
            },
            notes: entity.notes,
            classes: classes,
            marks: [],
            version: mark.version
        });
    }

    return rows;
}

function prepareInter(state: State, intermediate: Intermediate, diff: number | null, view: View): ResultItem[] {
    const standing = state.standings[intermediate.key];
    const bestTourStanding = standing.tourLeader;
    const precision = intermediate.type === 'standing' ? 0 : state.precision;

    const rows = [];
    for (const id of standing.ids) {
        const entity = state.entities[id];
        const mark = entity.marks[intermediate.key];
        const time = mark.time;
        const _state = standing.latestBibs.find((bib) => bib === id) ? 'new' : 'normal';

        let timeProp: Prop<number> | Prop<string>;
        let tourStandingProp: Prop<number>;
        if (isBonus(intermediate) && intermediate.type !== 'standing') {
            if (isRanked(mark.status)) {
                timeProp = {
                    value: time,
                    display: intermediate.type === 'bonus_time' ? time / 1000 : time,
                    leader: mark.rank === 1
                };

                tourStandingProp = {
                    display: '',
                    value: 0,
                    leader: false
                };
            } else {
                continue;
            }
        } else {
            timeProp = {
                display: formatTime(time + timePenalty[mark.status], standing.leader, precision, view.usePercent) || mark.status,
                value: time + timePenalty[mark.status],
                leader: mark.rank === 1
            };

            const bonusString = entity.bonusSeconds > 0 ? ' [' + entity.bonusSeconds / 1000 + 's]' : '';

            tourStandingProp = {
                value: mark.tourStanding,
                display: formatTime(mark.tourStanding, bestTourStanding, precision, view.usePercent) + bonusString,
                leader: mark.tourStanding === bestTourStanding
            };
        }

        let diffProp = {
            display: '',
            value: maxVal,
            leader: false
        };

        if (diff !== null) {
            const d = mark.diffs[diff];

            diffProp = {
                display: formatTime(d, standing.bestDiff[diff], precision, view.usePercent),
                value: d,
                leader: d === standing.bestDiff[diff]
            };
        }

        const classes = [entity.racer.nsa.toLowerCase(), _state];
        if (mark.rank == null) {
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

    const finishKey = state.intermediates.findIndex(inter => inter.type === 'finish');
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

        const marks: ResultItem['marks'] = [];
        let tourStandingProp = {
            value: maxVal,
            display: '',
            leader: false
        };

        if (row.marks[finishKey] != null) {
            const mark = row.marks[finishKey];
            const bonusString = row.bonusSeconds > 0 ? ' [' + row.bonusSeconds / 1000 + 's]' : '';
            tourStandingProp = {
                value: mark.tourStanding,
                display: formatTime(mark.tourStanding, bestTourStanding, 0, view.usePercent) + bonusString,
                leader: mark.tourStanding === bestTourStanding
            };
        }

        for (let i = 0; i < row.marks.length; i++) {
            const prevKey = previousSector[i];
            const mark = row.marks[i];
            const precision = state.intermediates[i].type === 'standing' ? 0 : state.precision;

            if (view.display === 'total') {
                marks[i] = {
                    display: formatTime(mark.time + timePenalty[mark.status], zeroes[i], precision, view.usePercent) || mark.status,
                    value: mark.time + timePenalty[mark.status],
                    state: state.standings[i].latestBibs.find((bib) => bib === id) ? 'new' : 'normal',
                    leader: mark.time === zeroes[i]
                };
            } else {
                const time =  mark.diffs[prevKey];
                marks[i] = {
                    display: time < maxVal ? formatTime(time, zeroes[i], precision, view.usePercent)
                        : (isRanked(mark.status) ? 'N/A' : mark.status),
                    value: time,
                    state: state.standings[i].latestBibs.find((bib) => bib === id) ? 'new' : 'normal',
                    leader: time === zeroes[i]
                };
            }
        }

        rows.push({
            state: _state,
            racer: row.racer,
            time: {display: '', value: 0, leader: false},
            tourStanding: tourStandingProp,
            rank: 1,
            diff: {display: '', value: 0, leader: false},
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

                return prepareInter(state, view.inter, view.diff?.key ?? null, view);
            } else {
                return prepareAnalysis(state, view);
            }
        })
    );
};

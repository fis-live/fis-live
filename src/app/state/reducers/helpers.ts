import { Update } from '@ngrx/entity';

import { maxVal, timeToStatusMap } from '../../fis/fis-constants';
import { RacerData, Result, Standing } from '../../models/racer';

import { State } from './result';

export function getValidDiff(time: number | null, zero: number | null): number {
    if (time == null || zero == null) {
        return maxVal;
    } else if (time >= maxVal || zero >= maxVal) {
        return maxVal;
    }

    return time - zero;
}

function getDiffs(results: Result[], inter: number, time: number | null): number[] {
    if (time == null || time >= maxVal) {
        return (new Array(inter)).fill(maxVal);
    }

    const diffs: number[] = [];
    for (let i = 0; i < inter; i++) {
        diffs[i] = getValidDiff(time, results[i].time);
    }

    return diffs;
}

export function registerResult(state: State, racer: number, time: number, inter: number): {changes: Update<RacerData>[]; standings: {[id: number]: Standing}} {
    const changes: Update<RacerData>[] = [];
    const standings: {[id: number]: Standing} = {};
    const results = [...state.entities[racer].results];

    if (results.length < inter) {
        const t = (time < maxVal) ? maxVal * 6 : time;

        for (let i = 0; i < inter; i++) {
            if (results[i] === undefined) {
                results[i] = {time: t, status: timeToStatusMap[time], rank: null, diffs: (new Array(i)).fill(maxVal)};
                standings[i] = {
                    leader: state.standings[i].leader,
                    bestDiff: state.standings[i].bestDiff,
                    version: state.standings[i].version + 1,
                    ids: [...state.standings[i].ids, racer]
                };
            }
        }
    }

    let rank: number = 1;
    let leader = state.standings[inter].leader;
    const bestDiff = state.standings[inter].bestDiff;
    let diffs: number[] = [];

    if (time < maxVal) {
        for (const id of state.standings[inter].ids) {
            if (state.entities[id].results[inter].time < maxVal) {
                if (time < state.entities[id].results[inter].time) {
                    const res = [...state.entities[id].results];
                    res[inter] = {...res[inter], rank: res[inter].rank + 1};
                    changes.push({
                        id: id,
                        changes: {results: res}
                    });
                } else if (time > state.entities[id].results[inter].time) {
                    rank += 1;
                }
            }
        }

        if (time < leader || leader === 0) {
            leader = time;
        }

        for (let i = 0; i < inter; i++) {
            diffs[i] = getValidDiff(time, results[i].time);
            if (diffs[i] < bestDiff[i]) {
                bestDiff[i] = diffs[i];
            }
        }
    } else {
        rank = null;
        diffs = (new Array(inter)).fill(maxVal);
    }

    standings[inter] = {
        leader: leader,
        version: state.standings[inter].version + 1,
        bestDiff: bestDiff,
        ids: [...state.standings[inter].ids, racer]
    };

    results[inter] = {time: time, status: timeToStatusMap[time], rank, diffs: diffs};
    changes.push({
        id: racer,
        changes: {results: results}
    });

    return { changes, standings };
}

export function updateResult(state: State, racer: number, time: number, inter: number): {changes: Update<RacerData>[]; standings: {[id: number]: Standing}} {
    const changes: Update<RacerData>[] = [];
    const standings: {[id: number]: Standing} = {};

    const results = [...state.entities[racer].results];
    const prev = results[inter].time;

    let rank = 1;
    for (const id of state.standings[inter].ids) {
        // TODO: Recheck leader and best diffs in this loop
        let rankAdj = 0;
        const t = state.entities[id].results[inter].time;

        if (racer === id || t > maxVal) {
            continue;
        }

        if (time < t) {
            rankAdj += 1;
        } else if (time > t) {
            rank += 1;
        }

        if (t > prev) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            const res = [...state.entities[id].results];
            res[inter] = {...res[inter], rank: res[inter].rank + rankAdj};
            changes.push({
                id: id,
                changes: {results: res}
            });
        }
    }

    if (time > maxVal) {
        rank = null;
    }
    results[inter] = {time: time, status: timeToStatusMap[time], rank, diffs: getDiffs(results, inter, time)};

    for (let i = inter + 1; i < results.length; i++) {
        const diffs = [...results[i].diffs];
        const bestDiff = state.standings[i].bestDiff;
        if (diffs[inter] === bestDiff[inter]) {
            // TODO: Recompute best diff
        }
        diffs[inter] = getValidDiff(results[i].time, time);

        results[i] = {...results[i], diffs};
        standings[i] = {
            ...state.standings[i],
            bestDiff,
            version: state.standings[i].version + 1,
        };
    }

    standings[inter] = {
        leader: 0,
        bestDiff: state.standings[inter].bestDiff,
        version: state.standings[inter].version + 1,
        ids: [...state.standings[inter].ids, racer]
    };

    changes.push({
        id: racer,
        changes: {results: results}
    });

    return { changes, standings };
}

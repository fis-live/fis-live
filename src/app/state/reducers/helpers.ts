import { Update } from '@ngrx/entity';

import { maxVal } from '../../fis/fis-constants';
import { RacerData, Result } from '../../models/racer';

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

export function registerResult(state: State, racer: number, time: number, inter: number): Update<RacerData>[] {
    const changes: Update<RacerData>[] = [];
    const results = [...state.entities[racer].results];
    if (results.length < inter) {
        const t = (time < maxVal) ? maxVal * 6 : time;

        for (let i = 0; i < inter; i++) {
            if (results[i] === undefined) {
                results[i] = {time: t, rank: null, diffs: (new Array(i)).fill(maxVal)};
            }
        }
    }

    let rank: number = 1;
    if (time < maxVal) {
        for (const t of state.sortedTimes[inter]) {
            if (time < t.time) {
                const res = [...state.entities[t.racer].results];
                res[inter] = {...res[inter], rank: res[inter].rank + 1};
                changes.push({
                    id: t.racer,
                    changes: {results: res}
                });
            } else if (time > t.time) {
                rank += 1;
            }
        }
    } else {
        rank = null;
    }

    results[inter] = {time, rank, diffs: getDiffs(results, inter, time)};
    changes.push({
        id: racer,
        changes: {results: results}
    });

    return changes;
}

export function updateResult(state: State, racer: number, time: number, inter: number): Update<RacerData>[] {
    const changes: Update<RacerData>[] = [];
    const results = [...state.entities[racer].results];
    const prev = results[inter].time;

    let rank = 1;
    for (const t of state.sortedTimes[inter]) {
        let rankAdj = 0;

        if (racer === t.racer) {
            continue;
        }

        if (time < t.time) {
            rankAdj += 1;
        } else if (time > t.time) {
            rank += 1;
        }

        if (t.time > prev) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            const res = [...state.entities[t.racer].results];
            res[inter] = {...res[inter], rank: res[inter].rank + rankAdj};
            changes.push({
                id: t.racer,
                changes: {results: res}
            });
        }
    }

    if (time > maxVal) {
        rank = null;
    }
    results[inter] = {time, rank, diffs: getDiffs(results, inter, time)};

    for (let i = inter + 1; i < results.length; i++) {
        const diffs = [...results[i].diffs];
        diffs[inter] = getValidDiff(results[i].time, time);

        results[i] = {...results[i], diffs};
    }

    changes.push({
        id: racer,
        changes: {results: results}
    });

    return changes;
}

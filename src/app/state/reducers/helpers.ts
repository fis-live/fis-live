import { Update } from '@ngrx/entity';

import { maxVal, timeToStatusMap } from '../../fis/fis-constants';
import { RacerData, Result, Standing } from '../../models/racer';

import { State } from './result';

export interface Changeset {
    changes: Update<RacerData>[];
    updatedStandings: {[id: number]: Standing};
}

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
        diffs[i] = getValidDiff(time, results[i].time.value);
    }

    return diffs;
}

export function registerResult(state: State, racer: number, time: number, inter: number): Changeset {
    const changeset: Changeset = {changes: [], updatedStandings: {}};
    const results = [...state.entities[racer].results];
    if (results.length < inter) {
        const t = (time < maxVal) ? {value: maxVal * 6, display: 'N/A'} : {value: time, display: timeToStatusMap[time]};

        for (let i = 0; i < inter; i++) {
            if (results[i] === undefined) {
                results[i] = {time: t, rank: null, diffs: (new Array(i)).fill(maxVal)};
                changeset.updatedStandings[i] = {
                    leader: 0,
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
        for (const t of state.standings[inter].ids) {
            if (state.entities[t].results[inter].time.value < maxVal) {
                if (time < state.entities[t].results[inter].time.value) {
                    const res = [...state.entities[t].results];
                    res[inter] = {...res[inter], rank: res[inter].rank + 1};
                    changeset.changes.push({
                        id: t,
                        changes: {results: res}
                    });
                } else if (time > state.entities[t].results[inter].time.value) {
                    rank += 1;
                }
            }
        }

        if (time < leader || leader === 0) {
            leader = time;
        }

        for (let i = 0; i < inter; i++) {
            diffs[i] = getValidDiff(time, results[i].time.value);
            if (diffs[i] < bestDiff[i]) {
                bestDiff[i] = diffs[i];
            }
        }
    } else {
        rank = null;
        diffs = (new Array(inter)).fill(maxVal);
    }

    changeset.updatedStandings[inter] = {
        leader: leader,
        version: state.standings[inter].version + 1,
        bestDiff: bestDiff,
        ids: [...state.standings[inter].ids, racer]
    };
    results[inter] = {time: {value: time, display: timeToStatusMap[time] || time}, rank, diffs: diffs};
    changeset.changes.push({
        id: racer,
        changes: {results: results}
    });

    return changeset;
}

export function updateResult(state: State, racer: number, time: number, inter: number): Changeset {
    const changeset: Changeset = {changes: [], updatedStandings: {}};
    const results = [...state.entities[racer].results];
    const prev = results[inter].time.value;

    let rank = 1;
    for (const id of state.standings[inter].ids) {
        let rankAdj = 0;
        const t = state.entities[id].results[inter].time.value;

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
            changeset.changes.push({
                id: id,
                changes: {results: res}
            });
        }
    }

    if (time > maxVal) {
        rank = null;
    }
    results[inter] = {time: {value: time, display: timeToStatusMap[time] || time}, rank, diffs: getDiffs(results, inter, time)};

    for (let i = inter + 1; i < results.length; i++) {
        const diffs = [...results[i].diffs];
        diffs[inter] = getValidDiff(results[i].time.value, time);

        results[i] = {...results[i], diffs};
        changeset.updatedStandings[i] = {
            leader: 0,
            bestDiff: state.standings[i].bestDiff,
            version: state.standings[i].version + 1,
            ids: state.standings[i].ids
        };
    }

    changeset.updatedStandings[inter] = {
        leader: 0,
        bestDiff: state.standings[inter].bestDiff,
        version: state.standings[inter].version + 1,
        ids: [...state.standings[inter].ids, racer]
    };

    changeset.changes.push({
        id: racer,
        changes: {results: results}
    });

    return changeset;
}

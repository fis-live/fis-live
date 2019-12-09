import { Update } from '@ngrx/entity';

import { maxVal, timeToStatusMap } from '../../fis/fis-constants';
import { RacerData, Standing } from '../../models/racer';

import { State } from './result';

export function getValidDiff(time: number | null, zero: number | null): number {
    if (time == null || zero == null) {
        return maxVal;
    } else if (time >= maxVal || zero >= maxVal) {
        return maxVal;
    }

    return time - zero;
}

export function registerResult(state: State,
                               racer: number,
                               time: number, inter: number,
                               isBonus: boolean): {changes: Update<RacerData>[]; standings: {[id: number]: Standing}} {
    const changes: Update<RacerData>[] = [];
    const standings: {[id: number]: Standing} = {};
    const results = [...state.entities[racer]!.marks];

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

    let rank: number | null = 1;
    let leader = state.standings[inter].leader;
    const bestDiff = [...state.standings[inter].bestDiff];
    let diffs: number[] = [];

    if (time < maxVal) {
        for (const id of state.standings[inter].ids) {
            if (state.entities[id]!.marks[inter].time < maxVal) {
                if (!isBonus) {
                    if (time < state.entities[id]!.marks[inter].time) {
                        const res = [...state.entities[id]!.marks];
                        const _rank = res[inter].rank;
                        res[inter] = {...res[inter], rank: _rank !== null ? _rank + 1 : null};
                        changes.push({
                            id: id,
                            changes: {marks: res}
                        });
                    } else if (time > state.entities[id]!.marks[inter].time) {
                        rank += 1;
                    }
                } else {
                    if (time > state.entities[id]!.marks[inter].time) {
                        const res = [...state.entities[id]!.marks];
                        const _rank = res[inter].rank;
                        res[inter] = {...res[inter], rank: _rank !== null ? _rank + 1 : null};
                        changes.push({
                            id: id,
                            changes: {marks: res}
                        });
                    } else if (time < state.entities[id]!.marks[inter].time) {
                        rank += 1;
                    }
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
        changes: {marks: results}
    });

    return { changes, standings };
}

export function updateResult(state: State,
                             racer: number,
                             time: number, inter: number,
                             isBonus: boolean): {changes: Update<RacerData>[]; standings: {[id: number]: Standing}} {
    const changes: Update<RacerData>[] = [];
    const standings: {[id: number]: Standing} = {};

    const results = [...state.entities[racer]!.marks];
    const prev = results[inter].time;
    const prevDiffs = results[inter].diffs;

    let leader = time;
    const bestDiffs = [...state.standings[inter].bestDiff];
    const checkDiffs = [];
    const diffs = [];
    for (let i = 0; i < inter; i++) {
        diffs[i] = getValidDiff(time, results[i].time);
        if (diffs[i] < bestDiffs[i]) {
            bestDiffs[i] = diffs[i];
        } else if (prevDiffs[i] === bestDiffs[i]) {
            checkDiffs.push(i);
            bestDiffs[i] = diffs[i];
        }
    }

    let rank: number | null = 1;
    for (const id of state.standings[inter].ids) {
        let rankAdj = 0;
        const t = state.entities[id]!.marks[inter].time;

        if (racer === id || t > maxVal) {
            continue;
        }

        for (const i of checkDiffs) {
            if (state.entities[id]!.marks[inter].diffs[i] < bestDiffs[i]) {
                bestDiffs[i] = state.entities[id]!.marks[inter].diffs[i];
            }
        }

        leader = t < leader ? t : leader;

        if (!isBonus) {
            if (time < t) {
                rankAdj += 1;
            } else if (time > t) {
                rank += 1;
            }

            if (t > prev) {
                rankAdj -= 1;
            }
        } else {
            if (time > t) {
                rankAdj += 1;
            } else if (time < t) {
                rank += 1;
            }

            if (t < prev && prev < maxVal) {
                rankAdj -= 1;
            }
        }

        if (rankAdj !== 0) {
            const res = [...state.entities[id]!.marks];
            const _rank = res[inter].rank;
            res[inter] = {...res[inter], rank: _rank !== null ? _rank + rankAdj : null};
            changes.push({
                id: id,
                changes: {marks: res}
            });
        }
    }

    if (time > maxVal) {
        rank = null;
    }
    results[inter] = {time: time, status: timeToStatusMap[time], rank, diffs};

    for (let i = inter + 1; i < results.length; i++) {
        const newDiffs = [...results[i].diffs];
        const bestDiff = [...state.standings[i].bestDiff];

        if (newDiffs[inter] === bestDiff[inter]) {
            bestDiff[inter] = maxVal;
            for (const id of state.standings[i].ids) {
                if (id === racer) {
                    continue;
                }

                if (state.entities[id]!.marks[i].diffs[inter] < bestDiff[inter]) {
                    bestDiff[inter] = state.entities[id]!.marks[i].diffs[inter];
                }
            }
        }

        newDiffs[inter] = getValidDiff(results[i].time, time);
        if (newDiffs[inter] < bestDiff[inter]) {
            bestDiff[inter] = newDiffs[inter];
        }

        results[i] = {...results[i], diffs: newDiffs};
        standings[i] = {
            ...state.standings[i],
            bestDiff: bestDiff,
            version: state.standings[i].version + 1,
        };
    }

    standings[inter] = {
        leader: leader,
        bestDiff: bestDiffs,
        version: state.standings[inter].version + 1,
        ids: state.standings[inter].ids
    };

    changes.push({
        id: racer,
        changes: {marks: results}
    });

    return { changes, standings };
}

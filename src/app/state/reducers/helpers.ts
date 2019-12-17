import { isRanked, maxVal, Status, timePenalty } from '../../fis/fis-constants';
import { Result } from '../../fis/models';
import { Mark } from '../../models/racer';

import { State } from './result';

export function getValidDiff(mark: Mark, zero: Mark): number {
    if (isRanked(mark.status) && isRanked(zero.status)) {
        return mark.time - zero.time;
    }

    return maxVal;
}

export function registerResultMutably(state: State, result: Result) {
    const intermediate = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
    const isBonus = state.intermediates[intermediate].type === 'bonus_points';
    const marks = state.entities[result.racer].marks;
    const mark: Mark = {
        time: result.time,
        status: result.status,
        rank: null,
        diffs: (new Array(intermediate)).fill(maxVal)
    };
    const standing = state.standings[intermediate];

    if (marks.length < intermediate) {
        for (let i = 0; i < intermediate; i++) {
            if (marks[i] === undefined) {
                marks[i] = {
                    time: 0,
                    status: isRanked(result.status) ? Status.NA : result.status,
                    rank: null,
                    diffs: (new Array(i)).fill(maxVal)
                };

                state.standings[i].ids.push(result.racer);
                state.standings[i].version += 1;
            }
        }
    }

    if (isRanked(result.status)) {
        let rank: number = 1;
        const time = result.time + timePenalty[result.status];

        for (const id of state.standings[intermediate].ids) {
            const _mark = state.entities[id].marks[intermediate];
            const t = _mark.time + timePenalty[_mark.status];

            if (_mark.rank !== null) {
                if ((time < t && !isBonus) || (time > t && isBonus)) {
                    _mark.rank += 1;
                } else if ((time > t && !isBonus) || (time < t && isBonus)) {
                    rank += 1;
                }
            }
        }

        if (time < standing.leader) {
            standing.leader = time;
        }

        for (let i = 0; i < intermediate; i++) {
            mark.diffs[i] = getValidDiff(mark, marks[i]);
            if (mark.diffs[i] < standing.bestDiff[i]) {
                standing.bestDiff[i] = mark.diffs[i];
            }
        }

        mark.rank = rank;
    }

    if (isRanked(result.status)) {
        standing.latestBibs = [result.racer, ...standing.latestBibs.slice(0, 2)];
    }

    marks[intermediate] = mark;
    standing.ids.push(result.racer);
    standing.version += 1;
}

export function updateResultMutably(state: State, result: Result) {
    const intermediate = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
    const isBonus = state.intermediates[intermediate].type === 'bonus_points';
    const standing = state.standings[intermediate];
    const entity = state.entities[result.racer];
    const prev = entity.marks[intermediate];
    const mark: Mark = {
        time: result.time,
        rank: 0,
        status: result.status,
        diffs: []
    };

    let leader = mark.time + timePenalty[result.status];

    if (prev.status === result.status && prev.time === result.time) {
        return;
    }

    const checkDiffs = [];

    // Calculate diffs and check if we need to find new best diff
    for (let i = 0; i < intermediate; i++) {
        mark.diffs[i] = getValidDiff(mark, entity.marks[i]);

        if (mark.diffs[i] <= standing.bestDiff[i]) {
            standing.bestDiff[i] = mark.diffs[i];
        } else if (prev.diffs[i] === standing.bestDiff[i]) {
            standing.bestDiff[i] = mark.diffs[i];
            checkDiffs.push(i);
        }
    }

    // Calculate new forward diffs
    for (let i = intermediate + 1; i < entity.marks.length; i++) {
        if (entity.marks[i].diffs[intermediate] === state.standings[i].bestDiff[intermediate]) {
            entity.marks[i].diffs[intermediate] = getValidDiff(entity.marks[i], mark);
            let best = maxVal;
            for (const id of state.standings[i].ids) {
                if (state.entities[id].marks[i].diffs[intermediate] < best) {
                    best = state.entities[id].marks[i].diffs[intermediate];
                }
            }
            state.standings[i].bestDiff[intermediate] = best;
        } else {
            entity.marks[i].diffs[intermediate] = getValidDiff(entity.marks[i], mark);
            if (entity.marks[i].diffs[intermediate] < state.standings[i].bestDiff[intermediate]) {
                state.standings[i].bestDiff[intermediate] = entity.marks[i].diffs[intermediate];
            }
        }

        state.standings[i].version += 1;
    }

    let rank = 1;
    const time = result.time + timePenalty[result.status];
    for (const id of standing.ids) {
        const mk = state.entities[id].marks[intermediate];
        const t = mk.time + timePenalty[mk.status];
        let rankAdj = 0;

        if (entity.id === id || mk.rank === null) {
            continue;
        }

        for (const i of checkDiffs) {
            if (mk.diffs[i] < standing.bestDiff[i]) {
                standing.bestDiff[i] = mk.diffs[i];
            }
        }

        leader = (t < leader) ? t : leader;

        if ((time < t && !isBonus) || (time > t && isBonus)) {
            rankAdj += 1;
        } else if ((time > t && !isBonus) || (time < t && isBonus)) {
            rank += 1;
        }

        if ((t > (prev.time + timePenalty[prev.status]) && !isBonus) ||
            (isBonus && t < (prev.time + timePenalty[prev.status]) && (prev.time + timePenalty[prev.status]) < maxVal)) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            mk.rank += rankAdj;
        }
    }

    mark.rank = isRanked(result.status) ? rank : null;
    entity.marks[intermediate] = mark;
    standing.version += 1;
}

import { isRanked, maxVal, Status, timePenalty } from '../../fis/fis-constants';
import { Result } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Mark, RacerData } from '../../models/racer';

import { State } from './result';

export function getValidDiff(mark: Mark, zero: Mark): number {
    if (isRanked(mark.status) && isRanked(zero.status)) {
        return mark.time - zero.time;
    }

    return maxVal;
}

export function isBonus(intermediate: Intermediate | null | undefined): boolean {
    return intermediate?.type  === 'bonus_points' || intermediate?.type  === 'bonus_time';
}

export function parseTimeString(str: string) {
    const timeArray = str.split(':');

    return (timeArray.length === 3) ?
        (Number(timeArray[0]) * 3600 + Number(timeArray[1]) * 60 + Number(timeArray[2])) * 1000 :
        (Number(timeArray[0]) * 60 + Number(timeArray[1])) * 1000;
}

export function registerResultMutably(state: State, result: Result) {
    const intermediate = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
    const _isBonus = isBonus(state.intermediates[intermediate]);
    const entity = state.entities[result.racer];
    const marks = entity.marks;
    const mark: Mark = {
        time: result.time,
        status: result.status,
        rank: null,
        diffs: (new Array(intermediate)).fill(maxVal),
        version: 0
    };
    const standing = state.standings[intermediate];

    if (state.intermediates[intermediate].type === 'bonus_time') {
        updateBonusSeconds(state, entity, result.time || 0, 0);
    }

    if (marks.length < intermediate) {
        for (let i = 0; i < intermediate; i++) {
            if (marks[i] === undefined) {
                marks[i] = {
                    time: 0,
                    status: isRanked(result.status) ? Status.NA : result.status,
                    rank: null,
                    diffs: (new Array(i)).fill(maxVal),
                    version: 0
                };

                state.standings[i].ids.push(result.racer);
                state.standings[i].version += 1;
            }
        }
    }

    if (isRanked(result.status)) {
        let rank: number = 1;
        const time = result.time + timePenalty[result.status];

        for (const id of standing.ids) {
            const _mark = state.entities[id].marks[intermediate];
            const t = _mark.time + timePenalty[_mark.status];

            if (_mark.rank !== null) {
                if ((time < t && !_isBonus) || (time > t && _isBonus)) {
                    _mark.rank += 1;
                } else if ((time > t && !_isBonus) || (time < t && _isBonus)) {
                    rank += 1;
                }
            }
        }

        if (!_isBonus) {
            if (time < standing.leader) {
                standing.leader = time;
            }

            for (let i = 0; i < intermediate; i++) {
                mark.diffs[i] = getValidDiff(mark, marks[i]);
                if (mark.diffs[i] < standing.bestDiff[i]) {
                    standing.bestDiff[i] = mark.diffs[i];
                }
            }
        }

        mark.rank = rank;
        standing.latestBibs = [result.racer, ...standing.latestBibs.slice(0, 2)];
    }

    if (marks[0].tourStanding !== undefined) {
        mark.tourStanding = mark.diffs[0] < maxVal ? marks[0].tourStanding + mark.diffs[0] - entity.bonusSeconds : maxVal;
        if (mark.tourStanding < standing.tourLeader) {
            standing.tourLeader = mark.tourStanding;
        }
    }

    marks[intermediate] = mark;
    standing.ids.push(result.racer);
    standing.version += 1;
}

function updateBonusSeconds(state: State, entity: RacerData, bonusSeconds: number, previous: number) {
    if (bonusSeconds === previous) {
        return;
    }

    const previousBonus = entity.bonusSeconds;
    const newBonus = entity.bonusSeconds + bonusSeconds - previous;
    const checkLeader = [];
    entity.bonusSeconds = newBonus;

    for (let i = 1; i < entity.marks.length; i++) {
        const time = entity.marks[i].tourStanding;
        if (time !== undefined && time < maxVal) {
            entity.marks[i].tourStanding = time + previousBonus - newBonus;
            state.standings[i].version += 1;

            if (entity.marks[i].tourStanding! < state.standings[i].tourLeader) {
                state.standings[i].tourLeader = entity.marks[i].tourStanding!;
            } else if (time === state.standings[i].tourLeader) {
                checkLeader.push(i);
            }
        }
    }

    for (const i of checkLeader) {
        let leader = maxVal;
        for (const id of state.standings[i].ids) {
            leader = Math.min(leader, state.entities[id].marks[i].tourStanding ?? maxVal);
        }

        state.standings[i].tourLeader = leader;
        state.standings[i].version += 1;
    }
}

export function updateResultMutably(state: State, result: Result) {
    const intermediate = result.intermediate === 99 ? state.intermediates.length - 1 : result.intermediate;
    const _isBonus = isBonus(state.intermediates[intermediate]);
    const standing = state.standings[intermediate];
    const entity = state.entities[result.racer];
    const prev = entity.marks[intermediate];
    const mark: Mark = {
        time: result.time,
        rank: 0,
        status: result.status,
        diffs: (new Array(intermediate)).fill(maxVal),
        version: 0
    };

    let leader = mark.time + timePenalty[result.status];
    let tourLeader = maxVal;

    if (prev.status === result.status && prev.time === result.time) {
        return;
    }

    if (state.intermediates[intermediate].type === 'bonus_time') {
        updateBonusSeconds(state, entity, result.time, prev.time);
    }

    const checkDiffs = [];

    if (!_isBonus) {
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
    }

    if (entity.marks[0].tourStanding !== undefined) {
        mark.tourStanding = mark.diffs[0] < maxVal ? entity.marks[0].tourStanding + mark.diffs[0] - entity.bonusSeconds : maxVal;
        tourLeader = Math.min(tourLeader, mark.tourStanding);
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
        if (mk.tourStanding !== undefined) {
            tourLeader = Math.min(tourLeader, mk.tourStanding);
        }

        if ((time < t && !_isBonus) || (time < maxVal && time > t && _isBonus)) {
            rankAdj += 1;
        } else if ((time > t && !_isBonus) || (time < t && _isBonus)) {
            rank += 1;
        }

        if ((t > (prev.time + timePenalty[prev.status]) && !_isBonus) ||
            (_isBonus && t < (prev.time + timePenalty[prev.status]) && (prev.time + timePenalty[prev.status]) < maxVal)) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            mk.rank += rankAdj;
        }
    }

    mark.rank = isRanked(result.status) ? rank : null;
    entity.marks[intermediate] = mark;
    standing.leader = _isBonus ? maxVal : leader;
    standing.tourLeader = tourLeader;
    standing.version += 1;
}

import { maxVal, timeToStatusMap } from '../../fis/fis-constants';
import { Mark, RacerData } from '../../models/racer';

import { State } from './result';

export function getValidDiff(time: number | null, zero: number | null): number {
    if (time == null || zero == null) {
        return maxVal;
    } else if (time >= maxVal || zero >= maxVal) {
        return maxVal;
    }

    return time - zero;
}

function incrementRank(entity: RacerData, inter: number, change: number): RacerData {
    const marks = [...entity.marks];
    const rank = marks[inter].rank;
    marks[inter] = {
        ...marks[inter],
        rank: rank !== null ? rank + change : null
    };

    return {
        ...entity,
        marks
    };
}

export function registerResultImmutably(standings: State['standings'],
                                        entities: State['entities'],
                                        racer: number,
                                        time: number, inter: number,
                                        isBonus: boolean) {
    const marks = [...entities[racer].marks];
    const mark: Mark = {
        time: time,
        status: timeToStatusMap[time],
        rank: null,
        diffs: (new Array(inter)).fill(maxVal)
    };

    let rank: number | null = 1;
    let leader = standings[inter].leader;
    const bestDiff = [...standings[inter].bestDiff];

    if (marks.length < inter) {
        const t = (time < maxVal) ? maxVal * 6 : time;

        for (let i = 0; i < inter; i++) {
            if (marks[i] === undefined) {
                marks[i] = {time: t, status: timeToStatusMap[time], rank: null, diffs: (new Array(i)).fill(maxVal)};
                standings[i] = {
                    leader: standings[i].leader,
                    bestDiff: standings[i].bestDiff,
                    version: standings[i].version + 1,
                    ids: [...standings[i].ids, racer]
                };
            }
        }
    }

    if (time < maxVal) {
        for (const id of standings[inter].ids) {
            const t = entities[id].marks[inter].time;

            if (t < maxVal) {
                if ((isBonus) ? time > t : time < t) {
                    entities[id] = incrementRank(entities[id], inter, 1);
                } else if ((isBonus) ? time < t : time > t) {
                    rank += 1;
                }
            }
        }

        if (time < leader || leader === 0) {
            leader = time;
        }

        for (let i = 0; i < inter; i++) {
            mark.diffs[i] = getValidDiff(time, marks[i].time);
            if (mark.diffs[i] < bestDiff[i]) {
                bestDiff[i] = mark.diffs[i];
            }
        }

        mark.rank = rank;
    }

    standings[inter] = {
        leader: leader,
        version: standings[inter].version + 1,
        bestDiff: bestDiff,
        ids: [...standings[inter].ids, racer]
    };

    marks[inter] = mark;
    entities[racer] = {
        ...entities[racer],
        marks: marks
    };
}

export function updateResultImmutably(
    standings: State['standings'],
    entities: State['entities'],
    racer: number,
    time: number,
    inter: number,
    isBonus: boolean
) {
    const marks = [...entities[racer].marks];
    const mark: Mark = {
        time: time,
        status: timeToStatusMap[time],
        rank: null,
        diffs: (new Array(inter)).fill(maxVal)
    };
    const prev = marks[inter];

    let leader = time;
    const bestDiffs = [...standings[inter].bestDiff];
    const checkDiffs = [];
    for (let i = 0; i < inter; i++) {
        mark.diffs[i] = getValidDiff(time, marks[i].time);
        if (mark.diffs[i] < bestDiffs[i]) {
            bestDiffs[i] = mark.diffs[i];
        } else if (prev.diffs[i] === bestDiffs[i]) {
            checkDiffs.push(i);
            bestDiffs[i] = mark.diffs[i];
        }
    }

    let rank: number | null = 1;
    for (const id of standings[inter].ids) {
        let rankAdj = 0;
        const t = entities[id].marks[inter].time;

        if (racer === id || t > maxVal) {
            continue;
        }

        for (const i of checkDiffs) {
            if (entities[id].marks[inter].diffs[i] < bestDiffs[i]) {
                bestDiffs[i] = entities[id].marks[inter].diffs[i];
            }
        }

        leader = t < leader ? t : leader;

        if (isBonus ? time > t : time < t) {
            rankAdj += 1;
        } else if (isBonus ? time < t : time > t) {
            rank += 1;
        }

        if (isBonus ? t < prev.time && prev.time < maxVal : t > prev.time) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            entities[id] = incrementRank(entities[id], inter, rankAdj);
        }
    }

    if (time > maxVal) {
        rank = null;
    }
    mark.rank = rank;
    marks[inter] = mark;

    for (let i = inter + 1; i < marks.length; i++) {
        const newDiffs = [...marks[i].diffs];
        const bestDiff = [...standings[i].bestDiff];

        if (newDiffs[inter] === bestDiff[inter]) {
            bestDiff[inter] = maxVal;
            for (const id of standings[i].ids) {
                if (id === racer) {
                    continue;
                }

                if (entities[id].marks[i].diffs[inter] < bestDiff[inter]) {
                    bestDiff[inter] = entities[id].marks[i].diffs[inter];
                }
            }
        }

        newDiffs[inter] = getValidDiff(marks[i].time, time);
        if (newDiffs[inter] < bestDiff[inter]) {
            bestDiff[inter] = newDiffs[inter];
        }

        marks[i] = {...marks[i], diffs: newDiffs};
        standings[i] = {
            ...standings[i],
            bestDiff: bestDiff,
            version: standings[i].version + 1,
        };
    }

    standings[inter] = {
        leader: leader,
        bestDiff: bestDiffs,
        version: standings[inter].version + 1,
        ids: standings[inter].ids
    };
    entities[racer] = {
        ...entities[racer],
        marks: marks
    };
}

export function registerResultMutably(state: State, draft: State,
                                      racer: number,
                                      time: number, inter: number,
                                      isBonus: boolean) {
    const marks = draft.entities[racer].marks;
    const mark: Mark = {
        time,
        status: timeToStatusMap[time],
        rank: null,
        diffs: (new Array(inter)).fill(maxVal)
    };
    const standing = draft.standings[inter];

    if (marks.length < inter) {
        const t = (time < maxVal) ? maxVal * 6 : time;

        for (let i = 0; i < inter; i++) {
            if (marks[i] === undefined) {
                marks[i] = {time: t, status: timeToStatusMap[time], rank: null, diffs: (new Array(i)).fill(maxVal)};
                draft.standings[i].ids.push(racer);
                draft.standings[i].version += 1;
            }
        }
    }

    if (time < maxVal) {
        let rank: number = 1;
        for (const id of state.standings[inter].ids) {
            const t = state.entities[id].marks[inter].time;
            if (t < maxVal) {
                if ((time < t && !isBonus) || (time > t && isBonus)) {
                    draft.entities[id].marks[inter].rank! += 1;
                } else if ((time > t && !isBonus) || (time < t && isBonus)) {
                    rank += 1;
                }
            }
        }

        if (time < standing.leader || standing.leader === 0) {
            standing.leader = time;
        }

        for (let i = 0; i < inter; i++) {
            mark.diffs[i] = getValidDiff(time, marks[i].time);
            if (mark.diffs[i] < standing.bestDiff[i]) {
                standing.bestDiff[i] = mark.diffs[i];
            }
        }

        mark.rank = rank;
    }

    marks[inter] = mark;
    standing.ids.push(racer);
    standing.version += 1;
}

export function updateResultMutably(state: State,
                                    racer: number,
                                    time: number, inter: number,
                                    isBonus: boolean) {
    const standing = state.standings[inter];
    const entity = state.entities[racer];
    const prev = entity.marks[inter];
    const mark: Mark = {
        time: time,
        rank: 0,
        status: status,
        diffs: []
    };

    let leader = mark.time;

    if (prev.time === time) {
        return;
    }

    const checkDiffs = [];

    // Calculate diffs and check if we need to find new best diff
    for (let i = 0; i < inter; i++) {
        mark.diffs[i] = getValidDiff(mark.time, entity.marks[i].time);

        if (mark.diffs[i] <= standing.bestDiff[i]) {
            standing.bestDiff[i] = time;
        } else if (prev.diffs[i] === standing.bestDiff[i]) {
            standing.bestDiff[i] = mark.diffs[i];
            checkDiffs.push(i);
        }
    }

    // Calculate new forward diffs
    for (let i = inter + 1; i < entity.marks.length; i++) {
        if (entity.marks[i].diffs[inter] === state.standings[i].bestDiff[inter]) {
            entity.marks[i].diffs[inter] = getValidDiff(entity.marks[i].time, mark.time);
            let best = maxVal;
            for (const id of state.standings[i].ids) {
                if (state.entities[id].marks[i].diffs[inter] < best) {
                    best = state.entities[id].marks[i].diffs[inter];
                }
            }
            state.standings[i].bestDiff[inter] = best;
        } else {
            entity.marks[i].diffs[inter] = getValidDiff(entity.marks[i].time, mark.time);
            if (entity.marks[i].diffs[inter] < state.standings[i].bestDiff[inter]) {
                state.standings[i].bestDiff[inter] = entity.marks[i].diffs[inter];
            }
        }

        state.standings[i].version += 1;
    }

    let rank = 1;
    for (const id of state.standings[inter].ids) {
        const mk = state.entities[id].marks[inter];
        let rankAdj = 0;

        if (entity.id === id || mk.rank === null) {
            continue;
        }

        for (const i of checkDiffs) {
            if (mk.diffs[i] < standing.bestDiff[i]) {
                standing.bestDiff[i] = mk.diffs[i];
            }
        }

        leader = (mk.time < leader) ? mk.time : leader;

        if ((mark.time < mk.time && !isBonus) || (mark.time > mk.time && isBonus)) {
            rankAdj += 1;
        } else if ((mark.time > mk.time && !isBonus) || (mark.time < mk.time && isBonus)) {
            rank += 1;
        }

        if ((mk.time > prev.time && !isBonus) || (isBonus && mk.time < prev.time && prev.time < maxVal)) {
            rankAdj -= 1;
        }

        if (rankAdj !== 0) {
            mk.rank += rankAdj;
        }
    }

    mark.rank = time < maxVal ? rank : null;
    entity.marks[inter] = mark;
    standing.version += 1;
}

export function registerPursuitTimeMutably(state: State, time: any) {
    const marks = state.entities[time.racer].marks;
    marks[0].time = time.time;
    marks[0].diffs = [time.time];

    const standing = state.standings[0];
    standing.version += 1;
    standing.leader = time.time < standing.leader ? time.time : standing.leader;
    standing.bestDiff = [standing.leader];

    for (let i = 1; i < marks.length; i++) {
        marks[i].diffs[0] = getValidDiff(marks[i].time, time.time);
        state.standings[i].version += 1;
        if (marks[i].diffs[0] < state.standings[i].bestDiff[0]) {
            state.standings[i].bestDiff[0] = marks[i].diffs[0];
        }
    }
}

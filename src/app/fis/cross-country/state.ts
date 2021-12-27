import { formatTime } from '../../utils/utils';
import { isBonus, isRanked, maxVal, Status, statusMap, timePenalty } from '../fis-constants';

import { Mark, RacerData, State } from './models';
import { MessageEvent, MeteoEvent, NoteEvent, ResultEvent, RunEvent } from './types';

export function getValidDiff(mark: Mark, zero: Mark): number {
    if (timePenalty[mark.status] === 0 && timePenalty[zero.status] === 0) {
        return mark.time - zero.time;
    }

    return maxVal;
}

export function handleUpdate(state: State, events: (ResultEvent | NoteEvent | RunEvent | MessageEvent | MeteoEvent)[], timestamp: number) {
    for (const event of events) {
        switch (event.type) {
            case 'inter':
            case 'bonuspoint':
            case 'bonustime':
            case 'standing':
            case 'finish': {
                const inter = state.interById[event.inter];
                const leader = state.standings[inter]?.leader ?? maxVal;
                const isUpdate = state.entities[event.bib].marks[inter] !== undefined;

                handleResultEvent(state, event);

                if (!state.isSprintFinals && !isUpdate && !isBonus(state.intermediates[inter]) && event.time > 0) {
                    const _event = {
                        racer: state.entities[event.bib].racer,
                        rank: state.entities[event.bib].marks[inter].rank,
                        diff: formatTime(event.time, leader, state.precision),
                        timestamp: timestamp
                    };
                    state.standings[inter].events = [_event, ...state.standings[inter].events.slice(0, 20)];
                }
                break;
            }

            case 'sanction':
            case 'dnf':
            case 'dns':
            case 'dq':
            case 'dsq':
            case 'ral':
            case 'nps':
            case 'lapped':
            case 'q':
            case 'nq':
            case 'currentlucky':
            case 'lucky':
            case 'ff':
            case 'start':
            case 'nextstart':
                handleNoteEvent(state, event);
                break;

            case 'activerun':
                state.activeRun = event.run - 1;
                break;
            case 'activeheat':
                state.activeHeat = event.run - 1;
                break;
        }
    }
}

function handleResultEvent(state: State, event: ResultEvent) {
    const intermediate = state.interById[event.inter];
    const entity = state.entities[event.bib];
    const isUpdate = state.entities[event.bib].marks[intermediate] !== undefined;

    switch (event.type) {
        case 'standing':
        case 'bonuspoint':
        case 'bonustime':
        case 'inter':
            registerResult(state, entity, Status.Default, event.time, intermediate, [event.run - 1, state.activeHeat]);
            break;
        case 'finish':
            setStatus(state, entity, Status.Finished);
            registerResult(state, entity, Status.Default, event.time, intermediate, [event.run - 1, state.activeHeat]);
            break;
    }

    if (!state.isSprintFinals && !isUpdate && event.time > 0) {
        state.standings[intermediate].latestBibs = [entity.racer.bib, ...state.standings[intermediate].latestBibs.slice(0, 2)];
    }
}

function setStatus(state: State, entity: RacerData, status: string) {
    entity.status = status;
    if (!state.isSprintFinals) {
        state.standings[0].version += 1;
        entity.marks[0].version += 1;
    }
}

function handleNoteEvent(state: State, event: NoteEvent) {
    const entity = state.entities[event.bib];

    switch (event.type) {
        case 'q':
            entity.notes.push('Q');
            for (let i = 0; i < state.intermediates.length; i++) {
                state.standings[i].version += 1;
            }
            break;
        case 'nq':
            const index = entity.notes.indexOf('Q');
            if (index > -1) {
                entity.notes.splice(index, 1);
                for (let i = 0; i < state.intermediates.length; i++) {
                    state.standings[i].version += 1;
                }
            }
            break;
        case 'sanction':
            entity.racer.hasYellowCard = true;
            for (let i = 0; i < state.intermediates.length; i++) {
                state.standings[i].version += 1;
            }
            break;
        case 'currentlucky':
        case 'lucky':
            entity.notes.push('LL');
            for (let i = 0; i < state.intermediates.length; i++) {
                state.standings[i].version += 1;
            }
            break;
        case 'ff':
            entity.notes.push('PF');
            for (let i = 0; i < state.intermediates.length; i++) {
                state.standings[i].version += 1;
            }
            break;
        case 'start':
        case 'nextstart':
            setStatus(state, entity, statusMap[event.type]);
            break;
        case 'ral':
        case 'dnf':
        case 'dns':
        case 'dq':
        case 'dsq':
        case 'nps':
        case 'lapped': {
            setStatus(state, entity, statusMap[event.type]);
            registerResult(state, entity, statusMap[event.type], 0, state.interById[99], [event.run - 1, state.activeHeat]);
            break;
        }
    }
}

export function registerResult(
    state: State,
    entity: RacerData,
    status: Status,
    time: number,
    intermediate: number,
    runInfo: [number, number | null]
) {
    const marks = entity.marks;
    const type = state.intermediates[intermediate].type;
    const mark: Mark = {
        time: type === 'bonus_time' || type === 'bonus_points' ? time : time - time % (10 ** (state.precision + 3)),
        status: status,
        rank: null,
        diffs: (new Array(Math.min(intermediate, 1))).fill(maxVal),
        version: 0,
        tourStanding: maxVal
    };

    if (state.isSprintFinals) {
        const [run, heat] = runInfo;
        const _prev = marks[run];
        if (_prev && (_prev.time === mark.time && _prev.status === mark.status)) {
            return;
        }

        registerHeat(state, entity, mark, _prev, run, heat!);
        marks[run] = mark;
        return;
    }

    const prev = marks[intermediate];
    const standing = state.standings[intermediate];

    if (prev != null) {
        if (prev.time === mark.time && prev.status === mark.status) {
            return;
        }

        removeResult(state, entity, intermediate);
    } else if (mark.time === 0 && mark.status === Status.Default) {
        return;
    }

    if (marks.length < intermediate) {
        for (let i = 0; i < intermediate; i++) {
            if (marks[i] === undefined) {
                marks[i] = {
                    time: 0,
                    status: timePenalty[status] === 0 ? Status.NA : status,
                    rank: null,
                    diffs: (new Array(i)).fill(maxVal),
                    version: 0,
                    tourStanding: maxVal
                };

                state.standings[i].ids.push(entity.racer.bib);
                state.standings[i].version += 1;
            }
        }
    }

    if (isRanked(status)) {
        switch (type) {
            case 'start_list':
            case 'inter':
            case 'finish':
                registerInter(state, entity, mark, intermediate);
                break;
            case 'standing':
                registerStanding(state, entity, mark, intermediate);
                break;
            case 'bonus_points':
            case 'bonus_time':
                registerBonus(state, entity, mark, intermediate, prev);
                break;
        }
    }

    marks[intermediate] = mark;
    if (!prev) {
        standing.ids.push(entity.racer.bib);
    }
    standing.version += 1;
}

function registerHeat(state: State, entity: RacerData, mark: Mark, prev: Mark | undefined, run: number, heat: number) {
    const standing = state.runs[run].heats[heat];

    let rank: number = 1;
    let leader = maxVal;
    const time = mark.time + timePenalty[mark.status];
    for (const id of standing.ids) {
        const _mark = state.entities[id].marks[run];

        if (entity.id !== id && _mark?.rank != null) {
            const t = _mark.time + timePenalty[_mark.status];
            leader = Math.min(t, leader);
            if (time < t) {
                _mark.rank += 1;
            } else if (time > t) {
                rank += 1;
            }

            if (prev?.rank && _mark.rank > prev.rank) {
                _mark.rank -= 1;
            }
        }
    }

    mark.rank = isRanked(mark.status) ? rank : null;
    if (standing.ids.indexOf(entity.id) === -1) {
        standing.ids.push(entity.id);
    }
    standing.version += 1;
    standing.leader = Math.min(time, leader);
}

function registerInter(state: State, entity: RacerData, mark: Mark, inter: number) {
    const standing = state.standings[inter];
    const marks = entity.marks;

    let rank: number = 1;
    const time = mark.time + timePenalty[mark.status];
    for (const id of standing.ids) {
        const _mark = state.entities[id].marks[inter];

        if (entity.id !== id && _mark.rank !== null) {
            const t = _mark.time + timePenalty[_mark.status];
            if (time < t) {
                _mark.rank += 1;
            } else if (time > t) {
                rank += 1;
            }
        }
    }
    mark.rank = rank;

    if (time < standing.leader) {
        standing.leader = time;
    }

    let i = 0;
    do {
        if (!isBonus(state.intermediates[i])) {
            mark.diffs[i] = getValidDiff(mark, marks[i]);
            if (mark.diffs[i] < standing.bestDiff[i]) {
                standing.bestDiff[i] = mark.diffs[i];
            }
        }
        i++;
    } while (i < inter);

    for (i = inter + 1; i < marks.length; i++) {
        if (!isBonus(state.intermediates[i])) {
            marks[i].diffs[inter] = getValidDiff(marks[i], mark);
            state.standings[i].version += 1;
            if (marks[i].diffs[inter] < state.standings[i].bestDiff[inter]) {
                state.standings[i].bestDiff[inter] = marks[i].diffs[inter];
            }
        }
    }

    if (inter !== 0 && mark.diffs[0] < maxVal && marks[0].tourStanding < maxVal) {
        mark.tourStanding = marks[0].tourStanding + mark.diffs[0] - entity.bonusSeconds;
        if (mark.tourStanding < standing.tourLeader) {
            standing.tourLeader = mark.tourStanding;
        }
    }
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
        if (time < maxVal) {
            entity.marks[i].tourStanding = time + previousBonus - newBonus;
            state.standings[i].version += 1;

            if (entity.marks[i].tourStanding <= state.standings[i].tourLeader) {
                state.standings[i].tourLeader = entity.marks[i].tourStanding;
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
    }
}

function removeResult(state: State, entity: RacerData, inter: number) {
    const standing = state.standings[inter];
    const prev = entity.marks[inter];

    let leader = maxVal;
    let tourLeader = maxVal;
    const checkDiffs = [];
    const bestDiffs = [];

    if (prev.rank === null) {
        return;
    }

    if (!isBonus(state.intermediates[inter])) {
        let i = 0;
        do {
            if (standing.bestDiff[i] < maxVal && prev.diffs[i] === standing.bestDiff[i]) {
                checkDiffs.push(i);
                bestDiffs[i] = maxVal;
            }
            i++;
        } while (i < inter);

        // Calculate new forward diffs
        for (i = inter + 1; i < entity.marks.length; i++) {
            if (state.standings[i].bestDiff[inter] < maxVal &&
                entity.marks[i].diffs[inter] === state.standings[i].bestDiff[inter]) {
                let best = maxVal;
                for (const id of state.standings[i].ids) {
                    if (id !== entity.id) {
                        best = Math.min(state.entities[id].marks[i].diffs[inter], best);
                    }
                }
                state.standings[i].bestDiff[inter] = best;
            }

            if (entity.marks[i].diffs[inter] < maxVal) {
                entity.marks[i].diffs[inter] = maxVal;
                state.standings[i].version += 1;
            }
        }
    }

    for (const id of standing.ids) {
        const mk = state.entities[id].marks[inter];
        if (entity.id === id || mk.rank === null) {
            continue;
        }

        for (const j of checkDiffs) {
            bestDiffs[j] = Math.min(mk.diffs[j], bestDiffs[j]);
        }

        leader = Math.min(mk.time + timePenalty[mk.status], leader);
        tourLeader = Math.min(mk.tourStanding, tourLeader);

        if (mk.rank > prev.rank) {
            mk.rank -= 1;
        }
    }

    for (const j of checkDiffs) {
        standing.bestDiff[j] = bestDiffs[j];
    }

    if (!isBonus(state.intermediates[inter]) || state.intermediates[inter].type === 'standing') {
        standing.leader = leader;
        if (state.intermediates[inter].type !== 'standing') {
            standing.tourLeader = tourLeader;
        }
    }
}

function registerBonus(state: State, entity: RacerData, mark: Mark, inter: number, prev?: Mark) {
    const standing = state.standings[inter];

    if (state.intermediates[inter].type === 'bonus_time') {
        updateBonusSeconds(state, entity, mark.time, prev?.time ?? 0);
    }

    let rank = 1;
    for (const id of standing.ids) {
        const _mark = state.entities[id].marks[inter];
        if (!(entity.id === id || _mark.rank === null)) {
            if (mark.time > _mark.time) {
                _mark.rank += 1;
            } else if (mark.time < _mark.time) {
                rank += 1;
            }
        }
    }

    mark.rank = rank;
}

function registerStanding(state: State, entity: RacerData, mark: Mark, inter: number) {
    const standing = state.standings[inter];
    const time = mark.time + timePenalty[mark.status];

    let rank = 1;
    for (const id of standing.ids) {
        const _mark = state.entities[id].marks[inter];
        if (!(entity.id === id || _mark.rank === null)) {
            const t = _mark.time + timePenalty[_mark.status];

            if (time < t) {
                _mark.rank += 1;
            } else if (time > t) {
                rank += 1;
            }
        }
    }

    if (time < standing.leader) {
        standing.leader = time;
    }

    mark.rank = rank;
}

import { guid, parseTimeString } from '../../utils/utils';
import { maxVal, Status, statusMap } from '../fis-constants';

import { Run, State } from './models';
import { registerResult } from './state';
import { Main } from './types';

function createHeats(state: State, heats = [5, 2, 1]) {
    let run: Run;
    for (let i = 0; i < heats.length; i++) {
        state.runs.push(run = {
            runNo: i + 1,
            currentLucky: [],
            heats: []
        });

        for (let j = 0; j < heats[i]; j++) {
            let name = '';
            if (i === 0) {
                name = '1/4 Final Heat ' + (j + 1);
            } else if (i === 1) {
                name = 'Semi Final Heat ' + (j + 1);
            } else {
                name = 'Final';
            }
            run.heats.push({
                version: 0,
                heatNo: j + 1,
                name,
                ids: [],
                leader: maxVal,
            });
        }
    }
}

export function initializeState(main: Main): State {
    const isMultipleRuns = main.runInfo[2] !== '';
    const runNo = main.runNo[0] - 1;
    const state: State = {
        id: guid(),
        ids: [],
        entities: {},
        intermediates: main.intermediates,
        interById: {},
        standings: {},
        precision: (main.runInfo[1] === 'Q' || main.runInfo[1] === 'TSPQ' || isMultipleRuns) ? -2 : -1,
        runs: [],
        isSprintFinals: isMultipleRuns,
        activeRun: runNo,
        activeHeat: main.runNo[1] !== null ? main.runNo[1] - 1 : null
    };

    if (isMultipleRuns) {
        createHeats(state);
    }

    for (const inter of main.intermediates) {
        state.interById[inter.id] = inter.key;
        state.standings[inter.key] = {
            version: 0,
            ids: [],
            leader: maxVal,
            latestBibs: [],
            bestDiff: (new Array(Math.max(inter.key, 1))).fill(maxVal),
            tourLeader: maxVal,
            events: []
        };
    }

    let order = 1;
    for (const racer of main.racers) {
        state.ids.push(racer.bib);
        state.entities[racer.bib] = {
            id: racer.bib,
            status: '',
            racer: racer,
            order: null,
            startTime: null,
            marks: [],
            notes: [],
            bonusSeconds: 0
        };
    }

    for (const [i, entry] of main.startList.entries()) {
        if (entry != null) {
            const [bib, note, _order, status, startTime, heats] = entry;
            const heatNo = isMultipleRuns ? (i - i % 10) / 10 - 1 : null;
            const results = main.results[bib];
            const entity = state.entities[bib];

            entity.status = statusMap[status || ''] || status || '';
            entity.order = order++;
            entity.startTime = startTime;

            if (heatNo !== null) {
                if (state.runs[runNo].heats[heatNo] === undefined) {
                    state.runs[runNo].heats[heatNo] = {
                        heatNo, ids: [], leader: 0, name: '', version: 0
                    };
                }
                state.runs[runNo].heats[heatNo].ids.push(bib);
            } else {
                if (main.raceInfo.discipline === 'PUR' && startTime) {
                    registerResult(
                        state,
                        state.entities[bib],
                        Status.Default,
                        parseTimeString(startTime),
                        0,
                        [runNo, heatNo]
                    );
                } else {
                    state.standings[0].ids.push(bib);
                    entity.marks = [{
                        time: 0,
                        status: Status.Initial,
                        rank: null,
                        diffs: [maxVal],
                        version: 0,
                        tourStanding: maxVal
                    }];
                }
            }

            if (results != null) {
                for (let j = 0; j < results.length; j++) {
                    if (results[j] != null) {
                        registerResult(
                            state,
                            state.entities[bib],
                            Status.Default,
                            results[j]!,
                            state.interById[main.resultKeys[j]],
                            [runNo, heatNo]
                        );
                    }
                }
            }

            switch (status) {
                case 'ral':
                case 'lapped':
                case 'dnf':
                case 'dq':
                case 'dsq':
                case 'dns':
                case 'nps':
                    registerResult(state, state.entities[bib], statusMap[status], 0, state.interById[99], [runNo, heatNo]);
                    break;
                default:
                    break;
            }
        }
    }

    if (!!main.tabrunsprec) {
        for (const [i, run] of main.tabrunsprec.entries()) {
            for (const [j, res] of run.entries()) {
                if (res !== null) {
                    const heatNo = (j - j % 10) / 10 - 1;
                    const [bib, note, time, , , status] = res;

                    registerResult(state, state.entities[bib], statusMap[note] || Status.Default, time, state.interById[99], [i, heatNo]);
                }
            }
        }
    }

    return state;
}

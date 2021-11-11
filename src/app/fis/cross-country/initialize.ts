import { guid } from '../../utils/utils';
import { maxVal, Status, Status as StatusEnum, statusMap } from '../fis-constants';

import { State } from './models';
import { registerResult } from './state';
import { Main } from './types';

export function initializeState(main: Main): State {
    const state: State = {
        id: guid(),
        ids: [],
        entities: {},
        intermediates: main.intermediates,
        interById: {},
        standings: {},
        precision: -1,
    };

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

    for (const racer of main.racers) {
        state.ids.push(racer.bib);
        const entry = main.startList[racer.bib];
        const results = main.results[racer.bib];
        if (entry != null) {
            state.standings[0].ids.push(racer.bib);
            state.entities[racer.bib] = {
                id: racer.bib,
                status: statusMap[entry.status || ''] || entry.status || '',
                racer: racer,
                marks: [{
                    time: 0,
                    status: StatusEnum.Default,
                    rank: entry.order || null,
                    diffs: [maxVal],
                    version: 0,
                    tourStanding: maxVal
                }],
                notes: [],
                bonusSeconds: 0
            };

            if (results != null) {
                for (let j = 0; j < results.length; j++) {
                    if (results[j] !== null && results[j]! > 0) {
                        registerResult(state, state.entities[racer.bib], Status.Default, results[j]!, j + 1);
                    }
                }
            }

            switch (entry.status) {
                case 'ral':
                case 'lapped':
                case 'dnf':
                case 'dq':
                case 'dns':
                case 'nps':
                    registerResult(state, state.entities[racer.bib], statusMap[entry.status], 0, state.interById[99]);
                    break;
                default:
                    break;
            }
        } else {
            state.entities[racer.bib] = {
                id: racer.bib,
                status: '',
                racer: racer,
                marks: [],
                notes: [],
                bonusSeconds: 0
            };
        }
    }

    return state;
}

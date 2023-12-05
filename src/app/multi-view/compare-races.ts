import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, reduce } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { Adapter } from '../fis/cross-country/adapter';
import { MainArray } from '../fis/cross-country/api/types';
import { initializeState } from '../fis/cross-country/initialize';
import { Mark, Racer } from '../fis/cross-country/models';
import { unserialize } from '../utils/unserialize';

export interface RaceComparison {
    races: {
        ids: number[];
        marks: { [ids: number]: Mark};
        leader: number;
    }[];
    ids: number[];
    entities: { [id: number]: Racer };
}

@Injectable({
    providedIn: 'root'
})
export class Comparator {
    private readonly baseURL = 'http://d16.novius.net/';

    constructor(private readonly _http: HttpClient) {}

    load(codices: number[]): Observable<RaceComparison> {
        return from(codices).pipe(
            concatMap((codex) => {
                return this._http.get(`${this.baseURL}mobile/cc-${codex}/main.xml`, {
                    responseType: 'text'
                }).pipe(
                    map((response) => {
                        const data = Adapter.parseMain(unserialize(response.slice(4, -5)) as MainArray, [], 'cc');
                        const state = initializeState(data);
                        const entities: { [ids: number]: Mark} = {};
                        const ids: number[] = [];
                        const finish = state.interById[99];
                        const racers = {} as { [id: number]: Racer };
                        const standing = state.standings[finish];
                        for (const id of standing.ids) {
                            ids.push(state.entities[id].racer.id);
                            racers[state.entities[id].racer.id] = state.entities[id].racer;
                            entities[state.entities[id].racer.id] = state.entities[id].marks[finish];
                        }

                        return {
                            leader: standing.leader,
                            ids,
                            entities,
                            racers
                        };
                    })
                );
            }),
            reduce((acc, value, i) => {
                for (const id of value.ids) {
                    if (acc.entities[id] === undefined) {
                        acc.entities[id] = value.racers[id];
                        acc.ids.push(id);
                    }
                }

                acc.races.push({
                    leader: value.leader,
                    ids: value.ids,
                    marks: value.entities
                });
                return acc;
            }, {races: [], ids: [], entities: {}} as RaceComparison)
        );
    }
}

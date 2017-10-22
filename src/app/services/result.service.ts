import { Observable } from 'rxjs/Observable';
import { Store, createSelector } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { AppState, getResultState, getFavoriteRacers } from '../state/reducers/index';
import { maxVal } from '../fis/fis-constants';

export interface ResultItem {
    racer: number;
    time: number;
    rank: number;
    status: string;
}

@Injectable()
export class ResultService {
    public results$: Observable<any>;
    private results: any = {};
    private i = 0;

    private addToStartList(row: ResultItem, isUpdate: boolean) {
        if (this.results[0] === undefined) {
            this.results[0] = [row];
        } else {
            if (isUpdate) {
                for (let j = 0; j < this.results[0].length; j++) {
                    if (row.racer === this.results[0][j].racer) {
                        this.results[0][j] = row;
                        break;
                    }
                }
            } else {
                this.results[0].push(row);
            }
        }
    }

    constructor(private _store: Store<AppState>) {
        this.results$ = _store.select(getResultState).map(res => {
            if (res.ids.length === 0) {
                this.results = {};
                this.i = 0;

                return this.results;
            }
            const length = res.history.length;
            for (this.i; this.i < length; this.i++) {
                const {racer, intermediate, isUpdate} = res.history[this.i];
                const row = {
                    racer: racer,
                    time: res.entities[racer].times[intermediate],
                    rank: null,
                    status: res.entities[racer].status
                };

                if (intermediate === 0) {
                    row.rank = res.entities[racer].order;
                    this.addToStartList(row, isUpdate);
                } else {
                    if (row.time < maxVal) {
                        row.rank = 1;
                    }

                    if (this.results[intermediate] === undefined) {
                        this.results[intermediate] = [row];
                    } else {
                        if (!isUpdate) {
                            if (row.time < maxVal) {
                                for (let j = 0; j < this.results[intermediate].length; j++) {
                                    if (this.results[intermediate][j].time < maxVal) {
                                        if (row.time < this.results[intermediate][j].time) {
                                            this.results[intermediate][j].rank += 1;
                                        } else if (row.time > this.results[intermediate][j].time) {
                                            row.rank += 1;
                                        }
                                    }
                                }
                            }

                            this.results[intermediate].push(row);
                        } else {
                            console.log('update');
                            let index: number;
                            const previousTime = res.history[this.i].prev;
                            for (let j = 0; j < this.results[intermediate].length; j++) {
                                if (row.racer === this.results[intermediate][j].racer) {
                                    index = j;
                                } else if (this.results[intermediate][j].time < maxVal) {
                                    if (previousTime < maxVal && previousTime < this.results[intermediate][j].time) {
                                        this.results[intermediate][j].rank -= 1;
                                    }

                                    if (row.time < maxVal) {
                                        if (row.time < this.results[intermediate][j].time) {
                                            this.results[intermediate][j].rank += 1;
                                        } else if (row.time > this.results[intermediate][j].time) {
                                            row.rank += 1;
                                        }
                                    }
                                }
                            }

                            this.results[intermediate][index] = row;
                        }
                    }
                }
            }

            return this.results;
        });
    }
}

import { Observable } from 'rxjs/Observable';
import { Store, createSelector } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { AppState, getResultState, getFavoriteRacers } from '../state/reducers/index';


@Injectable()
export class ResultService {
    public results$: Observable<Array<any>>;

    constructor(private _store: Store<AppState>) {
        // const getResults = createSelector(getFavoriteRacers, getResultState, (racers, results) => {
        //     const ret = [];
        //     Object.keys(results).forEach((key) => {
        //         if (results[key]) {
        //             ret[key] = [];
        //         }
        //         ret[key] = results[key].map((row) => Object.assign({}, row, {racer: racers[row.racer]}));
        //     });
        //
        //     return ret;
        // });

        const getResults = createSelector(getFavoriteRacers, getResultState, (racers, results) => {
            const ret = [];
            Object.keys(results).forEach((key) => {
                ret[key] = {
                    fastest: results[key].fastest,
                    entities: results[key].entities.map((row) => Object.assign({}, row, {racer: racers[row.racer]}))
                };
            });

            return ret;
        });

        // const getResults = createSelector(getFavoriteRacers, getResultState, (racers, results) => {
        //     const ret = [];
        //     Object.keys(results.results).forEach((key) => {
        //         results.results[key].forEach((row, index) => {
        //             if (ret[index] == null) {
        //                 ret[index] = [];
        //             }
        //
        //             if (row != null) {
        //                 ret[index].push(Object.assign({}, row, {racer: racers[key], rank: 12}));
        //             }
        //         });
        //     });
        //     return ret;
        // });

        this.results$ = _store.select(getResults);
    }
}

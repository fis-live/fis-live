import { Observable } from 'rxjs/Observable';
import { Store, createSelector } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { AppState, getResultState, getFavoriteRacers } from '../state/reducers/index';


@Injectable()
export class ResultService {
    public results$: Observable<any>;

    constructor(private _store: Store<AppState>) {
        this.results$ = _store.select(getResultState);
    }
}

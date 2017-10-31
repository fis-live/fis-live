import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState, selectAllResults } from '../state/reducers/index';
import { RacerData } from '../state/reducers/result';

@Injectable()
export class ResultService {
    public results$: Observable<RacerData[]>;

    constructor(private _store: Store<AppState>) {
        this.results$ = this._store.select(selectAllResults);
    }
}

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { AppState, selectAllResults } from '../state/reducers/index';
import { RacerData } from '../state/reducers/result';

@Injectable()
export class ResultService {
    public results$: Observable<RacerData[]>;

    constructor(private _store: Store<AppState>) {
        this.results$ = _store.select(selectAllResults);
    }
}

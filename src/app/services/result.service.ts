import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AppState, getResultState } from '../state/reducers/';
import { RacerData, State } from '../state/reducers/result';

@Injectable()
export class ResultService {
    public resultsSubscription: Subscription;
    public _change: BehaviorSubject<null> = new BehaviorSubject(null);

    public rows: RacerData[] = [];
    public history: any[] = [];

    constructor(private _store: Store<AppState>) {
        this.resultsSubscription = this._store.select(getResultState).subscribe((state: State) => {
            this.rows = [];
            for (let i = 0; i < state.ids.length; i++) {
                this.rows.push(state.entities[state.ids[i]]);
            }
            this.history = state.history;

            this._change.next(null);
        });
    }

    public get change(): Observable<null> {
        return this._change.asObservable();
    }
}

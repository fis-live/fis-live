import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState, selectAllResults } from '../state/reducers/index';
import { RacerData } from '../state/reducers/result';
import { Subscription } from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class ResultService {
    public resultsSubscription: Subscription;
    public _change: BehaviorSubject<null> = new BehaviorSubject(null);

    public rows: RacerData[] = [];

    constructor(private _store: Store<AppState>) {
        this.resultsSubscription = this._store.select(selectAllResults).subscribe((rows: RacerData[]) => {
            this.rows = rows;
            this._change.next(null);
        });
    }

    public get change(): Observable<null> {
        return this._change.asObservable();
    }
}

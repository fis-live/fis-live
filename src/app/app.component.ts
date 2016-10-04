import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import './rxjs-operators';

import { Observable } from "rxjs/Rx";

import { AppState, getRaceInfoState, getErrorState, getLoadingState } from "./reducers";
import { State } from "./reducers/race-info";
import { State as ErrorState } from './reducers/error';
import {LoadServerAction, LoadMainAction, StopUpdateAction} from "./actions/connection";
import { State as LoadingState } from "./reducers/loading";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    public codex: number;
    public raceInfo$: Observable<State>;
    public error$: Observable<ErrorState>;
    public loading$: Observable<LoadingState>;

    public rows: number[] = [];

    ngOnInit() {
        this._store.dispatch(new LoadServerAction());
    }

    constructor(private _store: Store<AppState>) {
        this.raceInfo$ = _store.let(getRaceInfoState);
        this.loading$ = _store.let(getLoadingState);
        this.error$ = _store.let(getErrorState);
    }

    public removeTab(): void {
        this.rows.pop();
    }

    public addTab(): void {
        this.rows.push(this.rows.length);
    }


    public startServer(): void {
        this.stopServer();

        this._store.dispatch(new LoadMainAction(2019));
    }

    public stopServer() {
        this._store.dispatch(new StopUpdateAction());
    }
}

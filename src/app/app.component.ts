import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import './rxjs-operators';

import { Observable } from "rxjs/Rx";

import { AppState, getRaceInfo } from "./reducers";
import { State } from "./reducers/race-info";
import { ConnectionActions } from "./actions/connection";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    public codex: number;
    public raceInfo$: Observable<State>;

    private rows: number[] = [];

    ngOnInit() {
        this._store.dispatch(ConnectionActions.loadServerAction());
    }

    constructor(private _store: Store<AppState>) {
        this.raceInfo$ = _store.let(getRaceInfo);
    }

    public removeTab(): void {
        this.rows.pop();
    }

    public addTab(): void {
        this.rows.push(this.rows.length);
    }


    public startServer(): void {
        this.stopServer();

        this._store.dispatch(ConnectionActions.loadMainAction(2019));
    }

    public stopServer() {
        this._store.dispatch(ConnectionActions.stopUpdateAction());
    }
}

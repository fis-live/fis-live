import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import './rxjs-operators';

import { Observable } from "rxjs/Rx";

import { AppState, getRaceInfoState, getErrorState, getLoadingState } from "./reducers";
import { State } from "./reducers/race-info";
import { State as ErrorState } from './reducers/error';
import { LoadServerAction, LoadMainAction, StopUpdateAction, ResetAction } from "./actions/connection";
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

    public rows: Array<number[]> = [[]];

    ngOnInit() {
        this._store.dispatch(new LoadServerAction());
    }

    constructor(private _store: Store<AppState>) {
        this.raceInfo$ = _store.let(getRaceInfoState);
        this.loading$ = _store.let(getLoadingState);
        this.error$ = _store.let(getErrorState).do((state: ErrorState) => {
            if (state.error) {
                let el: any = jQuery('.ui.modal');
                el.modal('show');
            }
        });
    }

    public removeTab(): void {
        let count = 0;
        for (let i= 0; i < this.rows.length; i++) {
            count += this.rows[i].length;
        }

        if (count <= 2) {
            this.rows[0].pop();
        } else if (count == 3) {
            this.rows[1].pop();
            this.rows.pop();
        } else if (count % 2 == 0) {
            this.rows[1].pop();
        } else {
            this.rows[0].pop();
        }
    }

    public addTab(): void {
        let count = 0;
        for (let i= 0; i < this.rows.length; i++) {
            count += this.rows[i].length;
        }

        if (count <= 1) {
            this.rows[0].push(this.rows[0].length);
        } else if (count == 2) {
            this.rows.push([0]);
        } else if (count % 2 == 0) {
            this.rows[0].push(this.rows[0].length);
        } else {
            this.rows[1].push(this.rows[1].length);
        }
    }


    public startServer(): void {
        this.stopServer();

        this._store.dispatch(new ResetAction());
        this._store.dispatch(new LoadMainAction(this.codex));
    }

    public stopServer() {
        this._store.dispatch(new StopUpdateAction());
    }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from "@angular/router";

import { Store } from "@ngrx/store";

import { Observable } from "rxjs/Rx";

import { AppState, getRaceInfoState, getLoadingState } from "../reducers";
import { State as RaceInfoState } from "../reducers/race-info";
import { LoadMainAction, StopUpdateAction, ResetAction } from "../actions/connection";
import { State as LoadingState } from "../reducers/loading";


@Component({
    selector: 'app-container',
    templateUrl: './container.component.html'
})
export class ContainerComponent implements OnInit {
    public codex: number;
    public raceInfo$: Observable<RaceInfoState>;
    public loading$: Observable<LoadingState>;

    public rows: Array<number[]> = [[0]];

    ngOnInit() {
        this.route.params
            .map((params: Params) => params['codex'])
            .subscribe((codex: string) => {
                if (codex) {
                    this.codex = +codex;

                    this.startServer();
                }
            });
    }

    constructor(private route: ActivatedRoute, private router: Router, private _store: Store<AppState>) {
        this.raceInfo$ = _store.let(getRaceInfoState);
        this.loading$ = _store.let(getLoadingState);
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

    public go() {
        this.router.navigate(['', this.codex ]);
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
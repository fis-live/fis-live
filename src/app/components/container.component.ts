import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map, pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { Racer } from '../models/racer';
import { WindowSize } from '../services/window-size';
import { LoadMain, StopUpdate } from '../state/actions/connection';
import { AppState, getLoadingState, getRaceInfoState, getSettingsState } from '../state/reducers/';
import { State as LoadingState } from '../state/reducers/loading';
import { State as RaceInfoState } from '../state/reducers/race-info';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
})
export class ContainerComponent implements OnInit, OnDestroy {
    public codex: number;
    public raceInfo$: Observable<RaceInfoState>;
    public loading$: Observable<LoadingState>;
    public favoriteRacers$: Observable<Racer[]>;
    public rows: Array<number[]> = [[0]];
    public width: number;
    public breakpoints: string[] = ['large', 'large'];
    public sidebarOpen = false;

    private widthSubscription: Subscription;

    ngOnInit() {
        this.route.params.pipe(map((params: Params) => params['codex']))
            .subscribe((codex: string) => {
                if (codex) {
                    this.codex = +codex;

                    this.reload();
                }
            });
    }

    constructor(private router: Router, private route: ActivatedRoute, private _store: Store<AppState>, private window: WindowSize) {
        this.raceInfo$ = _store.select(getRaceInfoState);
        this.loading$ = _store.select(getLoadingState);
        this.favoriteRacers$ = _store.select(getSettingsState).pipe(pluck('favoriteRacers'));
        this.widthSubscription = this.window.width$.subscribe((width) => this.setWidth(width));
    }

    public go(codex: number): void {
        this.router.navigate(['', codex]);
    }

    private setWidth(width: number) {
        this.width = width;

        this.setBreakpoints();
    }

    private setBreakpoints(): void {
        let w;
        if (this.rows[0] && this.rows[0].length > 0) {
            w = this.width / this.rows[0].length;
            this.breakpoints[0] = 'large';
            if (w < 768) {
                this.breakpoints[0] = 'small';
            }
            if (w < 330) {
                this.breakpoints[0] = 'mini';
            }
        }

        if (this.rows[1] && this.rows[1].length > 0) {
            w = this.width / this.rows[1].length;
            this.breakpoints[1] = 'large';
            if (w < 768) {
                this.breakpoints[1] = 'small';
            }
            if (w < 330) {
                this.breakpoints[1] = 'mini';
            }
        }
    }

    private removeTab(): void {
        let count = 0;
        for (let i = 0; i < this.rows.length; i++) {
            count += this.rows[i].length;
        }

        if (count <= 2) {
            this.rows[0].pop();
        } else if (count === 3) {
            this.rows[1].pop();
            this.rows.pop();
        } else if (count % 2 === 0) {
            this.rows[1].pop();
        } else {
            this.rows[0].pop();
        }
    }

    private addTab(): void {
        let count = 0;
        for (let i = 0; i < this.rows.length; i++) {
            count += this.rows[i].length;
        }

        if (count <= 1) {
            this.rows[0].push(this.rows[0].length);
        } else if (count === 2) {
            this.rows.push([0]);
        } else if (count % 2 === 0) {
            this.rows[0].push(this.rows[0].length);
        } else {
            this.rows[1].push(this.rows[1].length);
        }
    }

    public onRefresh(): void {
        this.reload();
    }

    public showSidebar(): void {
        this.sidebarOpen = true;
    }

    public configureTabs(action: string): void {
        if (action === 'add') {
            this.addTab();
        } else {
            this.removeTab();
        }

        this.setBreakpoints();
    }

    private reload(): void {
        this._store.dispatch(new StopUpdate());
        this._store.dispatch(new LoadMain(this.codex));
    }

    public ngOnDestroy(): void {
        this.widthSubscription.unsubscribe();
    }
}

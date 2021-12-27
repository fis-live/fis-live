import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Run } from '../fis/cross-country/models';
import { loadMain } from '../state/actions/connection';
import { AppState, getLoadingState, getRaceInfoState, getResultState } from '../state/reducers/';
import { State as LoadingState } from '../state/reducers/loading';
import { State as RaceInfoState } from '../state/reducers/race-info';
import { WindowSize } from '../utils/window-size';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
})
export class ContainerComponent implements OnInit, OnDestroy {
    public codex?: number;
    public sectorCode: 'nk' | 'cc' = 'cc';
    public raceInfo$: Observable<RaceInfoState>;
    public loading$: Observable<LoadingState>;
    public isSprintGrid$: Observable<boolean>;
    public runs$: Observable<Run[]>;
    public rows: Array<number[]> = [[0]];
    public width: number;
    public breakpoints: string[] = ['large', 'large'];
    public sidebarOpen = false;

    private widthSubscription: Subscription;

    ngOnInit() {
        this.route.url
            .subscribe((url) => {
                if (url[0]?.path === 'nk' || url[0]?.path === 'cc') {
                    this.codex = +url[1].path;
                    this.sectorCode = url[0].path;

                    this.reload();
                } else {
                    this.codex = +url[0]?.path;
                    this.sectorCode = 'cc';

                    this.reload();
                }
            });
    }

    constructor(private router: Router, private route: ActivatedRoute, private _store: Store<AppState>, private windowSize: WindowSize) {
        this.raceInfo$ = _store.select(getRaceInfoState);
        this.loading$ = _store.select(getLoadingState);
        this.runs$ = _store.select(getResultState).pipe(map((result) => result.runs));
        this.isSprintGrid$ = _store.select(getResultState).pipe(map((result) => !!result.isSprintFinals));
        this.width = window.innerWidth;
        this.widthSubscription = this.windowSize.width$.subscribe((width) => this.setWidth(width));
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
            if (w < 360) {
                this.breakpoints[0] = 'mini';
            }
        }

        if (this.rows[1] && this.rows[1].length > 0) {
            w = this.width / this.rows[1].length;
            this.breakpoints[1] = 'large';
            if (w < 768) {
                this.breakpoints[1] = 'small';
            }
            if (w < 360) {
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
        if (this.codex) {
            this._store.dispatch(loadMain({codex: this.codex, sectorCode: this.sectorCode}));
        }
    }

    public ngOnDestroy(): void {
        this.widthSubscription.unsubscribe();
    }
}

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of, timer } from 'rxjs';
import { catchError, concatMap, map, mapTo, mergeMapTo, startWith, switchMap, take, tap } from 'rxjs/operators';

import { FisConnectionService } from '../fis/fis-connection';

import { ConnectionActions, LoadingActions } from './actions';
import { AppState, getDelayState, getRaceInfoState } from './reducers';

@Injectable()
export class ConnectionEffects {

    loadServers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ConnectionActions.loadServers),
            startWith(ConnectionActions.loadServers()),
            switchMap(() =>
                this.api.getServerList().pipe(
                    switchMap(() => EMPTY),
                    catchError(() => of(ConnectionActions.showAlert({
                        alert: {
                            severity: 'danger',
                            message: 'Could not connect to FIS. Check your internet connection and try again.',
                            action: 'Retry',
                            actions: [ConnectionActions.loadServers()]
                        }
                    })))
                )
            )
        )
    );

    loadMain$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadMain),
        switchMap((action) =>
            this.api.poll(action.codex, action.sectorCode).pipe(
                concatMap((value, index) => {
                    if (index === 0 || value.timestamp === 0) {
                        return of(...value.actions);
                    }

                    return this.delay$.pipe(
                        switchMap((delay) => timer(Math.max(0, value.timestamp + delay - Date.now()))),
                        take(1),
                        mergeMapTo(value.actions)
                    );
                }),
                catchError(() => [
                    LoadingActions.hideLoading(),
                    ConnectionActions.showAlert({
                        alert: {
                            severity: 'danger',
                            message: 'Could not find live data. Check the codex and try again.',
                            action: 'Retry',
                            actions: [ConnectionActions.loadMain({ codex: action.codex, sectorCode: action.sectorCode })]
                        }
                    })
                ])
            )
        )
    ));

    loadCalendar$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadCalendar),
        startWith(ConnectionActions.loadCalendar()),
        switchMap(() =>
            this.api.loadCalendar().pipe(
                map((races) => ConnectionActions.setCalendar({ races })),
                catchError(() => [
                    LoadingActions.hideLoading(),
                    ConnectionActions.showAlert({
                        alert: {
                            severity: 'danger',
                            message: 'Could not load calendar. Check your internet connection and try again.',
                            action: 'Retry',
                            actions: [ConnectionActions.loadCalendar()]
                        }
                    })
                ])
            )
        )
    ));

    title$ = createEffect(() => this.store.select(getRaceInfoState).pipe(
        tap(race => {
            if (race.info.raceName !== '') {
                this.title.setTitle(race.info.raceName + ', ' + race.info.place);
            } else {
                this.title.setTitle('Fis Live');
            }
        })
    ), { dispatch: false });

    loading$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadMain),
        mapTo(LoadingActions.showLoading())
    ));

    private delay$: Observable<number>;

    constructor(private actions$: Actions, private api: FisConnectionService, private store: Store<AppState>, private title: Title) {
        this.delay$ = store.select(getDelayState);
    }
}

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { catchError, map, mapTo, startWith, switchMap } from 'rxjs/operators';

import { FisConnectionService } from '../fis/fis-connection';
import { DelayBehavior, delayBy } from '../utils/delayBy';

import { ConnectionActions, LoadingActions } from './actions';
import { AppState, getDelayState } from './reducers';

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
            this.api.poll(action.codex).pipe(
                delayBy(this.store.select(getDelayState), (value) => value.shouldDelay ? value.shouldDelay : DelayBehavior.Delay),
                catchError(() => [
                    LoadingActions.hideLoading(),
                    ConnectionActions.showAlert({
                        alert: {
                            severity: 'danger',
                            message: 'Could not find live data. Check the codex and try again.',
                            action: 'Retry',
                            actions: [ConnectionActions.loadMain({ codex: null })]
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
                map((races) => ConnectionActions.setCalendar({races})),
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

    loading$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadMain),
        mapTo(LoadingActions.showLoading())
    ));

    constructor(private actions$: Actions, private api: FisConnectionService, private store: Store<AppState>) { }
}

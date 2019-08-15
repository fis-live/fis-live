import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { catchError, map, mapTo, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

import { parseMain, parseUpdate } from '../fis/fis-parser';
import { FisConnectionService } from '../services/fis-connection';
import { delayBy } from '../utils/delayBy';

import { ConnectionActions, LoadingActions } from './actions';
import { AppState, getDelayState } from './reducers';

@Injectable()
export class ConnectionEffects {

    loadServers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ConnectionActions.loadServers),
            startWith(ConnectionActions.loadServers()),
            switchMap(() =>
                this._connection.getServerList().pipe(
                    map(() => ConnectionActions.selectServer()),
                    catchError(() => {
                        return of(ConnectionActions.showAlert({alert: {
                            severity: 'danger',
                            message: 'Could not connect to FIS. Check your internet connection and try again.',
                            action: 'Retry',
                            actions: [ConnectionActions.loadServers()]
                        }}));
                    })
                )
            )
        )
    );

    selectServer$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.selectServer),
        tap(() => this._connection.selectServer())
    ), { dispatch: false });

    loadMain$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadMain),
        switchMap((action) =>
            this._connection.loadMain(action.codex).pipe(
                mergeMap(data => {
                    const actions = parseMain(data);
                    const suffix = data.runinfo[1] === 'Q' ? 'QUA' : 'SL';

                    return [
                        ConnectionActions.batch({ actions: [ConnectionActions.reset(), ...actions] }),
                        LoadingActions.hideLoading(),
                        ConnectionActions.loadPdf({ doc: suffix }),
                        ConnectionActions.loadUpdate()
                    ];
                }),
                catchError(() => {
                    return [LoadingActions.hideLoading(), ConnectionActions.selectServer(), ConnectionActions.showAlert({
                        alert: {
                        severity: 'danger',
                        message: 'Could not find live data. Check the codex and try again.',
                        action: 'Retry',
                        actions: [ConnectionActions.loadMain({ codex: null })]
                    }})];
                })
            )
        )
    ));

    loadPdf$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadPdf),
        switchMap((action) =>
            this._connection.loadPdf(action.doc).pipe(
                map(actions => ConnectionActions.batch({actions})),
                catchError((error) => {
                    console.log(error);
                    return EMPTY;
                })
            )
        )
    ));

    loadUpdate$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadUpdate, ConnectionActions.stopUpdate),
        switchMap(action => {
            if (action.type === ConnectionActions.stopUpdate.type) {
                return EMPTY;
            }

            return this._connection.poll().pipe(
                mergeMap(data => parseUpdate(data)),
                delayBy(this.store.pipe(select(getDelayState))),
                catchError(() => {
                    return [
                        ConnectionActions.selectServer(),
                        ConnectionActions.loadMain({codex: null})
                    ];
                })
            );
        })
    ));

    loadCalendar$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadCalendar),
        startWith(ConnectionActions.loadCalendar()),
        switchMap(() =>
            this._connection.loadCalendar().pipe(
                map((races) => ConnectionActions.setCalendar({races})),
                catchError(() => {
                    return [LoadingActions.hideLoading(), ConnectionActions.showAlert({ alert: {
                        severity: 'danger',
                        message: 'Could not load calendar. Check your internet connection and try again.',
                        action: 'Retry',
                        actions: [ConnectionActions.loadCalendar()]
                    }})];
                })
            )
        )
    ));

    loading$ = createEffect(() => this.actions$.pipe(
        ofType(ConnectionActions.loadMain),
        mapTo(LoadingActions.showLoading())
    ));

    constructor(private actions$: Actions, private _connection: FisConnectionService, private store: Store<AppState>) { }
}

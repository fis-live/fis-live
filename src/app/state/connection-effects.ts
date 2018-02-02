import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { empty } from 'rxjs/observable/empty';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { catchError, delay, map, mapTo, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

import { parseMain, parseUpdate } from '../fis/fis-parser';
import { FisServer } from '../models/fis-server';
import { Race } from '../models/race';
import { FisConnectionService } from '../services/fis-connection';

import * as ConnectionActions from './actions/connection';
import { AppState, getDelayState } from './reducers';

@Injectable()
export class ConnectionEffects {

    public delay = 0;

    @Effect() loadServers$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS).pipe(
            startWith(new ConnectionActions.LoadServer()),
            switchMap(() => this._connection.getServerList()),
            map((servers: FisServer[]) => new ConnectionActions.SelectServer()),
            catchError((error) => {
                return of(new ConnectionActions.ShowAlert({
                    severity: 'danger',
                    message: 'Could not connect to FIS. Check your internet connection and try again.',
                    action: 'Retry',
                    actions: [new ConnectionActions.LoadServer()]
                }));
            })
        );

    @Effect({dispatch: false}) selectServer$ = this.actions$
        .ofType(ConnectionActions.SELECT_SERVER).pipe(tap((action => this._connection.selectServer())));

    @Effect() loadMain$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .pipe(
            switchMap((action: ConnectionActions.LoadMain) => this._connection.loadMain(action.payload)),
            mergeMap(data => {
                const actions = parseMain(data);
                const suffix = data.runinfo[1] === 'Q' ? 'QUA' : 'SL';

                return of<Action>(new ConnectionActions.Batch([new ConnectionActions.Reset(), ...actions]),
                    new ConnectionActions.HideLoading(),
                    new ConnectionActions.LoadPdf(suffix),
                    new ConnectionActions.LoadUpdate()
                );
            }),
            catchError((error) => {
                return from([new ConnectionActions.HideLoading(), new ConnectionActions.ShowAlert({
                    severity: 'danger',
                    message: 'Could not find live data. Check the codex and try again.',
                    action: 'Retry',
                    actions: [new ConnectionActions.LoadMain(null)]
                })]);
            })
        );

    @Effect() loadPdf$ = this.actions$
        .ofType(ConnectionActions.LOAD_PDF)
        .pipe(
            switchMap((action: ConnectionActions.LoadPdf) => this._connection.loadPdf(action.payload)),
            mergeMap(actions => of(new ConnectionActions.Batch(actions))),
            catchError((error) => {
                console.log(error);
                return empty();
            })
        );

    @Effect() loadUpdate$ = this.actions$
        .ofType(ConnectionActions.LOAD_UPDATE, ConnectionActions.STOP_UPDATE)
        .pipe(switchMap(action => {
                if (action.type === ConnectionActions.STOP_UPDATE) {
                    return empty();
                }

                return this._connection.poll()
                    .pipe(
                        mergeMap(data => {
                        const actions = parseUpdate(data);

                        return from(actions).pipe(delay(this.delay));
                        }),
                        catchError((error) => {
                            return from([
                                new ConnectionActions.SelectServer(),
                                new ConnectionActions.LoadMain(null)
                            ]);
                        })
                    );
            })
        );

    @Effect() loadCalendar$ = this.actions$
        .ofType(ConnectionActions.LOAD_CALENDAR)
        .pipe(
            startWith(new ConnectionActions.LoadCalendar()),
            switchMap((action) => this._connection.loadCalendar()),
            map((races: Race[]) => new ConnectionActions.SetCalendar(races)),
            catchError((error) => {
                return from([new ConnectionActions.HideLoading(), new ConnectionActions.ShowAlert({
                    severity: 'danger',
                    message: 'Could not load calendar. Check your internet connection and try again.',
                    action: 'Retry',
                    actions: [new ConnectionActions.LoadCalendar()]
                })]);
            })
        );

    @Effect() loading$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .pipe(mapTo(new ConnectionActions.ShowLoading()));

    constructor(private actions$: Actions, private _connection: FisConnectionService, private store: Store<AppState>) {
        this.store.select(getDelayState).subscribe((value) => {
            this.delay = isNaN(value) ? this.delay : +value;
        });
    }
}

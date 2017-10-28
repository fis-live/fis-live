import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { FisConnectionService } from '../services/fis-connection';
import * as ConnectionActions from './actions/connection';
import { FisServer } from '../models/fis-server';
import { parseMain, parseUpdate } from '../fis/fis-parser';
import { Store } from '@ngrx/store';
import { AppState, getDelayState } from './reducers/index';
import { map, startWith, switchMap, catchError, tap, mergeMap, mapTo, delay } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { from } from 'rxjs/observable/from';
import { empty } from 'rxjs/observable/empty';

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

                return of(...actions,
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
                    actions: [new ConnectionActions.Reset(), new ConnectionActions.LoadMain(null)]
                })]);
            })
        );

    @Effect() loadPdf$ = this.actions$
        .ofType(ConnectionActions.LOAD_PDF)
        .pipe(
            switchMap((action: ConnectionActions.LoadPdf) => this._connection.loadPdf(action.payload)),
            mergeMap(actions => from(actions)),
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
                                new ConnectionActions.Reset(),
                                new ConnectionActions.SelectServer(),
                                new ConnectionActions.LoadMain(null)
                            ]);
                        })
                    );
            })
        );

    @Effect() loading$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .pipe(mapTo(new ConnectionActions.ShowLoading()));

    constructor(private actions$: Actions, private _connection: FisConnectionService, private store: Store<AppState>) {
        store.select(getDelayState).subscribe((delay) => {
            this.delay = isNaN(delay) ? this.delay : +delay;
        });
    }
}

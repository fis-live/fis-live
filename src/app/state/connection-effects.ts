import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { EMPTY, from, of } from 'rxjs';
import { catchError, delay, map, mapTo, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

import { parseMain, parseUpdate } from '../fis/fis-parser';
import { FisServer } from '../models/fis-server';
import { Race } from '../models/race';
import { FisConnectionService } from '../services/fis-connection';

import {
    Batch,
    ConnectionActionTypes,
    HideLoading,
    LoadCalendar,
    LoadMain, LoadPdf, LoadServers, LoadUpdate, Reset,
    SelectServer,
    SetCalendar,
    ShowAlert,
    ShowLoading
} from './actions/connection';
import { AppState, getDelayState } from './reducers';

@Injectable()
export class ConnectionEffects {

    public delay = 0;

    @Effect() loadServers$ = this.actions$
        .ofType(ConnectionActionTypes.LoadServers).pipe(
            startWith(new LoadServers()),
            switchMap(() => this._connection.getServerList()),
            map((servers: FisServer[]) => new SelectServer()),
            catchError((error) => {
                return of(new ShowAlert({
                    severity: 'danger',
                    message: 'Could not connect to FIS. Check your internet connection and try again.',
                    action: 'Retry',
                    actions: [new LoadServers()]
                }));
            })
        );

    @Effect({dispatch: false}) selectServer$ = this.actions$
        .ofType(ConnectionActionTypes.SelectServer).pipe(tap((action => this._connection.selectServer())));

    @Effect() loadMain$ = this.actions$
        .ofType(ConnectionActionTypes.LoadMain)
        .pipe(
            switchMap((action: LoadMain) => this._connection.loadMain(action.payload)),
            mergeMap(data => {
                const actions = parseMain(data);
                const suffix = data.runinfo[1] === 'Q' ? 'QUA' : 'SL';

                return of<Action>(new Batch([new Reset(), ...actions]),
                    new HideLoading(),
                    new LoadPdf(suffix),
                    new LoadUpdate()
                );
            }),
            catchError((error) => {
                return from([new HideLoading(), new ShowAlert({
                    severity: 'danger',
                    message: 'Could not find live data. Check the codex and try again.',
                    action: 'Retry',
                    actions: [new LoadMain(null)]
                })]);
            })
        );

    @Effect() loadPdf$ = this.actions$
        .ofType(ConnectionActionTypes.LoadPdf)
        .pipe(
            switchMap((action: LoadPdf) => this._connection.loadPdf(action.payload)),
            mergeMap(actions => of(new Batch(actions))),
            catchError((error) => {
                console.log(error);
                return EMPTY;
            })
        );

    @Effect() loadUpdate$ = this.actions$
        .ofType(ConnectionActionTypes.LoadUpdate, ConnectionActionTypes.StopUpdate)
        .pipe(switchMap(action => {
                if (action.type === ConnectionActionTypes.StopUpdate) {
                    return EMPTY;
                }

                return this._connection.poll()
                    .pipe(
                        mergeMap(data => {
                        const actions = parseUpdate(data);

                        return from(actions).pipe(delay(this.delay));
                        }),
                        catchError((error) => {
                            return from([
                                new SelectServer(),
                                new LoadMain(null)
                            ]);
                        })
                    );
            })
        );

    @Effect() loadCalendar$ = this.actions$
        .ofType(ConnectionActionTypes.LoadCalendar)
        .pipe(
            startWith(new LoadCalendar()),
            switchMap((action) => this._connection.loadCalendar()),
            map((races: Race[]) => new SetCalendar(races)),
            catchError((error) => {
                return from([new HideLoading(), new ShowAlert({
                    severity: 'danger',
                    message: 'Could not load calendar. Check your internet connection and try again.',
                    action: 'Retry',
                    actions: [new LoadCalendar()]
                })]);
            })
        );

    @Effect() loading$ = this.actions$
        .ofType(ConnectionActionTypes.LoadMain)
        .pipe(mapTo(new ShowLoading()));

    constructor(private actions$: Actions, private _connection: FisConnectionService, private store: Store<AppState>) {
        this.store.select(getDelayState).subscribe((value) => {
            this.delay = isNaN(value) ? this.delay : +value;
        });
    }
}

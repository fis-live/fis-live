import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { catchError, map, mapTo, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

import { parseMain, parseUpdate } from '../fis/fis-parser';
import { FisConnectionService } from '../services/fis-connection';
import { delayBy } from '../utils/delayBy';

import {
    Batch,
    ConnectionActionTypes,
    LoadCalendar, LoadMain, LoadPdf, LoadServers, LoadUpdate,
    Reset,
    SelectServer,
    SetCalendar,
    ShowAlert, StopUpdate
} from './actions/connection';
import { HideLoading, ShowLoading } from './actions/loading';
import { AppState, getDelayState } from './reducers';

@Injectable()
export class ConnectionEffects {

    @Effect() loadServers$ = this.actions$.pipe(
        ofType<LoadServers>(ConnectionActionTypes.LoadServers),
        startWith(new LoadServers()),
        switchMap(() =>
            this._connection.getServerList().pipe(
                map(() => new SelectServer()),
                catchError(() => {
                    return of(new ShowAlert({
                        severity: 'danger',
                        message: 'Could not connect to FIS. Check your internet connection and try again.',
                        action: 'Retry',
                        actions: [new LoadServers()]
                    }));
                })
            )
        )
    );

    @Effect({dispatch: false}) selectServer$ = this.actions$.pipe(
        ofType<SelectServer>(ConnectionActionTypes.SelectServer),
        tap(() => this._connection.selectServer())
    );

    @Effect() loadMain$ = this.actions$.pipe(
        ofType<LoadMain>(ConnectionActionTypes.LoadMain),
        switchMap((action) =>
            this._connection.loadMain(action.payload).pipe(
                mergeMap(data => {
                    const actions = parseMain(data);
                    const suffix = data.runinfo[1] === 'Q' ? 'QUA' : 'SL';

                    return [
                        new Batch([new Reset(), ...actions]),
                        new HideLoading(),
                        new LoadPdf(suffix),
                        new LoadUpdate()
                    ];
                }),
                catchError(() => {
                    return [new HideLoading(), new SelectServer(), new ShowAlert({
                        severity: 'danger',
                        message: 'Could not find live data. Check the codex and try again.',
                        action: 'Retry',
                        actions: [new LoadMain(null)]
                    })];
                })
            )
        )
    );

    @Effect() loadPdf$ = this.actions$.pipe(
        ofType<LoadPdf>(ConnectionActionTypes.LoadPdf),
        switchMap((action) =>
            this._connection.loadPdf(action.payload).pipe(
                map(actions => new Batch(actions)),
                catchError((error) => {
                    console.log(error);
                    return EMPTY;
                })
            )
        )
    );

    @Effect() loadUpdate$ = this.actions$.pipe(
        ofType<LoadUpdate | StopUpdate>(ConnectionActionTypes.LoadUpdate, ConnectionActionTypes.StopUpdate),
        switchMap(action => {
            if (action.type === ConnectionActionTypes.StopUpdate) {
                return EMPTY;
            }

            return this._connection.poll().pipe(
                mergeMap(data => parseUpdate(data)),
                delayBy(this.store.pipe(select(getDelayState))),
                catchError(() => {
                    return [
                        new SelectServer(),
                        new LoadMain(null)
                    ];
                })
            );
        })
    );

    @Effect() loadCalendar$ = this.actions$.pipe(
        ofType<LoadCalendar>(ConnectionActionTypes.LoadCalendar),
        startWith(new LoadCalendar()),
        switchMap(() =>
            this._connection.loadCalendar().pipe(
                map((races) => new SetCalendar(races)),
                catchError(() => {
                    return [new HideLoading(), new ShowAlert({
                        severity: 'danger',
                        message: 'Could not load calendar. Check your internet connection and try again.',
                        action: 'Retry',
                        actions: [new LoadCalendar()]
                    })];
                })
            )
        )
    );

    @Effect() loading$ = this.actions$.pipe(
        ofType<LoadMain>(ConnectionActionTypes.LoadMain),
        mapTo(new ShowLoading())
    );

    constructor(private actions$: Actions, private _connection: FisConnectionService, private store: Store<AppState>) { }
}

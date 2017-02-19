import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { FisConnectionService } from '../services/fis-connection';
import {
    ConnectionActions,
    ShowAlertAction,
    LoadServerAction,
    LoadMainAction,
    SelectServerAction,
    LoadUpdateAction,
    ResetAction
} from './actions';
import { FisServer } from '../models/fis-server';
import { ShowLoadingAction, HideLoadingAction, LoadPdfAction } from './actions/connection';
import { parseMain, parseUpdate } from '../fis/fis-parser';

@Injectable()
export class ConnectionEffects {

    @Effect() loadServers$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS)
        .startWith(new LoadServerAction())
        .switchMap(() => this._connection.getServerList()
            .map((servers: FisServer[]) => new SelectServerAction())
            .catch((error) => {
                return Observable.of(new ShowAlertAction({
                    severity: 'danger',
                    message: 'Could not connect to FIS. Check your internet connection and try again.',
                    action: 'Retry',
                    actions: [new LoadServerAction()]
                }));
            })
        );

    @Effect({dispatch: false}) selectServer$ = this.actions$
        .ofType(ConnectionActions.SELECT_SERVER)
        .do(action => this._connection.selectServer());

    @Effect() loadMain$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .switchMap(action => this._connection.poll(action.payload)
            .mergeMap(data => {
                const actions = parseMain(data);
                const suffix = data.runinfo[1] == 'Q' ? 'QUA' : 'SL';

                return Observable.of(...actions, new HideLoadingAction(), new LoadPdfAction(suffix));
            })
            .catch((error) => {
                return Observable.of(new HideLoadingAction(), new ShowAlertAction({
                    severity: 'danger',
                    message: 'Could not find live data. Check the codex and try again.',
                    action: 'Retry',
                    actions: [new ResetAction(), new LoadMainAction(null)]
                }));
            })
        );

    @Effect() loadPdf$ = this.actions$
        .ofType(ConnectionActions.LOAD_PDF)
        .switchMap(action => this._connection.loadPdf(action.payload)
            .mergeMap(actions => {
                return Observable.from(actions);
            })
            .catch((error) => {
                console.log(error);
                return Observable.empty();
            })
        );

    @Effect() loadUpdate$ = this.actions$
        .ofType(ConnectionActions.LOAD_UPDATE, ConnectionActions.STOP_UPDATE)
        .switchMap(action => {
                if (action.type === ConnectionActions.STOP_UPDATE) {
                    return Observable.empty();
                }

                return this._connection.poll()
                    .mergeMap(data => {
                        const actions = parseUpdate(data);

                        return Observable.of(...actions);
                    })
                    .catch((error) => {
                        console.log(error);
                        return Observable.of(new ShowAlertAction({
                            severity: 'danger',
                            message: 'Could not find live data. Check the codex and try again.',
                            action: 'Retry',
                            actions: [new LoadUpdateAction()]
                        }));
                    });
            }
        );

    @Effect() loading$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .mapTo(new ShowLoadingAction());

    constructor(private actions$: Actions, private _connection: FisConnectionService) { }
}

import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { FisConnectionService } from "../services/fis-connection.service";
import { FisServer } from "../services/fis-server";
import { RaceActions, ConnectionActions } from "../actions";
import { Racer } from "../models/racer";

@Injectable()
export class ConnectionEffects {
    constructor(private actions$: Actions, private _connection: FisConnectionService) { }

    @Effect() loadServers$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS)
        .switchMap(() => this._connection.getServerList()
            .map((servers: FisServer[]) => ConnectionActions.loadServerSuccessAction())
            .catch((error) => {
                console.log(error);
                return Observable.of(ConnectionActions.loadServerErrorAction())
            })
        );

    @Effect({ dispatch: false }) selectServer$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS_SUCCESS)
        .do(action => this._connection.selectServer());

    @Effect() loadMain$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .switchMap(action => this._connection.poll(action.payload)
            .mergeMap(data => {
                let actions = [];
                actions.push(RaceActions.updateRaceInfoAction({eventName: data.raceinfo[0], raceName: data.raceinfo[1]}));
                actions.push(RaceActions.setRaceMessageAction(data.message));

                for ( let i = 0; i < data.racers.length; i++ ) {
                    if (data.racers[i] !== null) {
                        actions.push(RaceActions.addRacerAction(new Racer(data.racers[i][0],
                            data.racers[i][1], data.racers[i][3], data.racers[i][2], data.racers[i][4])));
                    }
                }

                for ( let i = 0; i < data.result.length; i++ ) {
                    if (data.result[i]) {
                        for ( let j = 0; j < data.result[i].length; j++) {
                            actions.push(
                                RaceActions.registerResultAction({intermediate: j, racer: i, time: data.result[i][j]})
                            );
                        }
                    }
                }

                data.racedef.forEach((def, index) => {
                    actions.push(RaceActions.addIntermediateAction({key: index, id: def[1], distance: def[2], name: def[0]}));
                });

                return Observable.of(...actions);
            })
            .catch((error) => {
                console.log(error);
                return Observable.of(ConnectionActions.loadServerErrorAction())
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
                    let actions = [];
                    console.log(data);

                    return Observable.of(...actions, ConnectionActions.loadUpdateAction());
                })
                .catch((error) => {
                    console.log(error);
                    return Observable.of(ConnectionActions.loadServerErrorAction())
                })
            }
        );
}
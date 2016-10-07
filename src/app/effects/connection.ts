import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { FisConnectionService } from "../services/fis-connection.service";
import { FisServer } from "../services/fis-server";
import {
    ConnectionActions, LoadServerErrorAction, LoadServerSuccessAction, LoadUpdateAction,
    UpdateRaceInfoAction, SetRaceMessageAction, RegisterResultAction, AddIntermediateAction,
    AddRacerAction
} from "../actions";

@Injectable()
export class ConnectionEffects {
    constructor(private actions$: Actions, private _connection: FisConnectionService) { }

    @Effect() loadServers$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS)
        .switchMap(() => this._connection.getServerList()
            .map((servers: FisServer[]) => new LoadServerSuccessAction())
            .catch((error) => {
                console.log(error);
                return Observable.of(new LoadServerErrorAction())
            })
        );

    @Effect({ dispatch: false }) selectServer$ = this.actions$
        .ofType(ConnectionActions.LOAD_SERVERS_SUCCESS)
        .do(action => this._connection.selectServer());

    @Effect() loadMain$ = this.actions$
        .ofType(ConnectionActions.LOAD_MAIN)
        .switchMap(action => this._connection.poll(action.payload)
            .mergeMap(data => {
                console.log(data);
                let actions = [];
                actions.push(new UpdateRaceInfoAction({eventName: data.raceinfo[0], raceName: data.raceinfo[1]}));
                actions.push(new SetRaceMessageAction(data.message));

                for ( let i = 0; i < data.racers.length; i++ ) {
                    if (data.racers[i] !== null) {
                        actions.push(new AddRacerAction({
                                id: data.racers[i][0],
                                bib: data.racers[i][1],
                                firstName: data.racers[i][3],
                                lastName: data.racers[i][2].split(' ').map(char=> char[0] + char.substr(1).toLowerCase()).join(' '),
                                nationality: data.racers[i][4]
                            })
                        );
                    }
                }

                for ( let i = 0; i < data.result.length; i++ ) {
                    if (data.result[i]) {
                        for ( let j = 0; j < data.result[i].length; j++) {
                            actions.push(
                                new RegisterResultAction({intermediate: j, racer: i, time: data.result[i][j]})
                            );
                        }
                    }
                }

                data.racedef.forEach((def, index) => {
                    let name: string = 'Finish';
                    if (def[0] === 'inter') {
                        name = 'Intermediate ' + def[1];
                    }

                    actions.push(new AddIntermediateAction({key: index, id: def[1], distance: def[2], name: name}));
                });

                return Observable.of(...actions);
            })
            .catch((error) => {
                console.log(error);
                return Observable.of(new LoadServerErrorAction())
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

                    return Observable.of(...actions, new LoadUpdateAction());
                })
                .catch((error) => {
                    console.log(error);
                    return Observable.of(new LoadServerErrorAction())
                })
            }
        );
}
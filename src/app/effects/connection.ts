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
import {AddStartListAction, UpdateMeteoAction} from "../actions/race";
import {LoadMainAction} from "../actions/connection";
import {RaceInfo} from "../models/race-info";
import {Meteo} from "../models/meteo";

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
                
                let raceInfo: RaceInfo = {
                    eventName: '',
                    raceName: '',
                    slopeName: '',
                    discipline: '',
                    gender: '',
                    category: '',
                    place: '',
                    temperatureUnit: '',
                    lengthUnit: '',
                    speedUnit: '',
                    team: '',
                    tds: ''
                };
                let idx = 0;
                raceInfo.eventName = data.raceinfo[idx++];
                raceInfo.raceName = data.raceinfo[idx++];
                raceInfo.slopeName = data.raceinfo[idx++];
                raceInfo.discipline = data.raceinfo[idx++].toUpperCase();
                raceInfo.gender = data.raceinfo[idx++].toUpperCase();
                raceInfo.category = data.raceinfo[idx++].toUpperCase();
                raceInfo.place = data.raceinfo[idx++];
                raceInfo.temperatureUnit = data.raceinfo[idx++];
                raceInfo.lengthUnit = data.raceinfo[idx++];
                raceInfo.speedUnit = data.raceinfo[idx++];
                idx = idx + 3;
                raceInfo.team = data.raceinfo[idx++];
                raceInfo.tds = data.raceinfo[idx];
                if (raceInfo.temperatureUnit.length == 1) {
                    raceInfo.temperatureUnit = "°" + raceInfo.temperatureUnit;
                }
                if (raceInfo.lengthUnit == null) {
                    raceInfo.lengthUnit = "meters";
                }
                if (raceInfo.speedUnit == null) {
                    raceInfo.speedUnit = "kmh";
                }

                let meteo: Meteo = {
                    air_temperature: null,
                    wind: '',
                    weather: '',
                    snow_condition: '',
                    snow_temperature: null,
                    humidity: null
                };
                idx= 0;

                meteo.air_temperature = data.meteo[idx++];
                meteo.wind = data.meteo[idx++];
                meteo.weather = data.meteo[idx++];
                meteo.snow_temperature = data.meteo[idx++];
                meteo.humidity = data.meteo[idx++];
                meteo.snow_condition = data.meteo[idx];
                
                actions.push(new UpdateRaceInfoAction(raceInfo));
                actions.push(new SetRaceMessageAction(data.message));
                actions.push(new UpdateMeteoAction(meteo));

                data.racedef.forEach((def, index) => {
                    let name: string = 'Finish';
                    if (def[0] === 'inter') {
                        name = 'Intermediate ' + def[1];
                    }

                    actions.push(new AddIntermediateAction({key: index, id: def[1], distance: def[2], name: name}));
                });

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

                for (let i = 0; i < data.startlist.length; i++) {
                    actions.push(
                        new AddStartListAction({racer: data.startlist[i][0], status: data.startlist[i][1], order: i + 1})
                    );
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
                    // data.events.forEach((event) => {
                    //     switch (event[0]) {
                    //         case "start":
                    //             if (this.noRunActif == event[1]) {
                    //                 this.runCourant.registerStatus(event[2], event[0]);
                    //             }
                    //             break;
                    //         case "inter":
                    //             if (this.noRunActif == event[1]) {
                    //                 this.runCourant.registerResult(event[3] - 1, event[2], event[4], false);
                    //             }
                    //             break;
                    //         case "finish":
                    //             if (this.noRunActif == event[1]) {
                    //                 this.runCourant.registerResult(event[3], event[2], event[4], false);
                    //                 this.runCourant.registerStatus(event[2], event[0]);
                    //             }
                    //             break;
                    //         case "falsestart":
                    //             break;
                    //         case "dnf":
                    //         case "dns":
                    //         case "dq":
                    //         case "q":
                    //         case "nq":
                    //         case "lucky":
                    //         case "lapped":
                    //         case "ff":
                    //         case "ral":
                    //             if (this.noRunActif == event[1]) {
                    //                 this.runCourant.registerStatus(event[2], event[0]);
                    //             }
                    //             break;
                    //         case "nextstart":
                    //             if (this.noRunActif == event[1]) {
                    //                 this.runCourant.registerStatus(event[2], event[0]);
                    //             }
                    //             break;
                    //         case "tds":
                    //             break;
                    //         case "activeheat":
                    //             break;
                    //         case "meteo":
                    //             meteoInfo = new Array();
                    //             meteoInfo.push(event[1], event[2], event[3], event[4], event[5], event[6]);
                    //             this.meteo.update(meteoInfo);
                    //             break;
                    //         case "palmier":
                    //             break;
                    //         case "message":
                    //             actions.push(new SetRaceMessageAction(event[1]));
                    //             break;
                    //         case "reloadmain":
                    //             return Observable.of(new LoadMainAction({}));
                    //     }
                    // });
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
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
import {AddStartListAction, UpdateMeteoAction, SetStatusAction} from "../actions/race";
import {LoadMainAction, ResetAction} from "../actions/connection";
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

    @Effect() loadPdf$ = this.actions$
        .ofType('LOAD_PDF')
        .switchMap(() => this._connection.loadPdf()
            .map(result => {
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const pattern = /\d+:\d+/;
                let currentBib = 1;
                let racers = [];
                let pages = result.length;
                let isPursuit = false;
                let racer = {bib: null, time: null, isWave: null, shirt: null};

                for (let j = 0; j < pages; j++) {
                    let count = result[j].length;
                    let start = false;

                    for (let i = 0; i < count; i++) {
                        let str = result[j][i];

                        if (str.startsWith('LANE')) {
                            isPursuit = true;
                        }

                        if (!start) {
                            if (str.endsWith('REMARKS')) {
                                start = true;
                            } else {
                                continue;
                            }
                        }
                        if (str == 'shirt') {
                            if (racer.bib) {
                                racers[racer.bib] = racer;

                                racer = {bib: null, time: null, isWave: null, shirt: null};
                                racer.bib = currentBib + 1;
                                currentBib += 1;
                            } else {
                                racer.bib = currentBib;
                            }

                            racer.shirt = result[j][i - 1];
                        }

                        if (str == 'Wave:') {
                            racer.bib = currentBib;
                            racers[racer.bib] = racer;

                            racer = {bib: null, time: null, isWave: null, shirt: null};
                            currentBib += 1;

                            racer.bib = currentBib;
                            racer.isWave = true;
                        }

                        if (pattern.test(str) && isPursuit) {
                            let timeArray = str.split(':');

                            racer.time = (timeArray.length === 3) ? (Number(timeArray[0])*3600 + Number(timeArray[1])*60 + Number(timeArray[2]))*1000 : (Number(timeArray[0])*60 + Number(timeArray[1]))*1000;
                        }

                        if (str == currentBib + 1 && months.indexOf(result[j][i + 1]) == -1) {
                            racer.bib = currentBib;
                            racers[racer.bib] = racer;

                            racer = {bib: null, time: null, isWave: null, shirt: null};
                            racer.bib = currentBib + 1;
                            currentBib += 1;
                        }
                    }
                }

                racers[racer.bib] = racer;

                console.log(racers);

                return {type: 'UPDATE_START_LIST', payload: racers};
            })
            .catch((error) => {
                console.log(error);
                return Observable.of(new LoadServerErrorAction())
            })
        );

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
                idx = 0;

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

                const nationalities: { [short: string]: string } = {
                    'SWE': 'Sweden',
                    'NOR': 'Norway',
                    'FIN': 'Finland',
                    'GER': 'Germany',
                    'FRA': 'France',
                    'AUT': 'Austria',
                    'USA': 'United States',
                    'RUS': 'Russia',
                    'KAZ': 'Kazakhstan',
                    'ITA': 'Italy',
                    'CZE': 'Czech Republic',
                    'SUI': 'Switzerland',
                    'POL': 'Poland',
                    'JPN': 'Japan',
                    'CAN': 'Canada',
                    'SLO': 'Slovenia',
                    'SVK': 'Slovakia',
                    'GBR': 'United Kingdom',
                    'EST': 'Estonia',
                    'LAT': 'Latvia',
                    'DEN': 'Denmark',
                    'ROU': 'Romania',
                    'KOR': 'South Korea',
                    'BUL': 'Bulgaria',
                    'IRL': 'Ireland',
                    'ARM': 'Armenia',
                    'BLR': 'Belarus',
                    'ISL': 'Iceland',
                    'SPA': 'Spain',
                    'AUS': 'Australia',
                    'CRO': 'Croatia',
                    'LIE': 'Liechtenstein'
                };

                for ( let i = 0; i < data.racers.length; i++ ) {
                    if (data.racers[i] !== null) {
                        actions.push(new AddRacerAction({
                                id: data.racers[i][0],
                                bib: data.racers[i][1],
                                firstName: data.racers[i][3],
                                lastName: data.racers[i][2].split(' ').map(char=> char[0] + char.substr(1).toLowerCase()).join(' '),
                                nationality: nationalities[data.racers[i][4]] || data.racers[i][4]
                            })
                        );
                    }
                }

                for (let i = 0; i < data.startlist.length; i++) {
                    actions.push(
                        new AddStartListAction({racer: data.startlist[i][0], status: data.startlist[i][1], order: i + 1, time: null, color: null})
                    );
                }

                for ( let i = 0; i < data.result.length; i++ ) {
                    if (data.result[i]) {
                        for ( let j = 0; j < data.result[i].length; j++) {
                            actions.push(
                                new RegisterResultAction({intermediate: data.racedef[j][1], racer: i, time: data.result[i][j]})
                            );
                        }
                    }
                }

                return Observable.of(...actions, {type: 'LOAD_PDF'}, new LoadUpdateAction());
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
                    if (data.events) {
                        console.debug(data);
                        data.events.forEach((event) => {
                            switch (event[0]) {
                                case "start":
                                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                                    break;
                                case "inter":
                                    actions.push(new RegisterResultAction({intermediate: event[3], racer: event[2], time: event[4]}));
                                    break;
                                case "finish":
                                    actions.push(new RegisterResultAction({intermediate: event[3], racer: event[2], time: event[4]}));
                                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                                    break;
                                case "falsestart":
                                    break;
                                case "dnf":
                                case "dns":
                                case "dq":
                                case "q":
                                case "nq":
                                case "lucky":
                                case "lapped":
                                case "ff":
                                case "ral":
                                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                                    break;
                                case "nextstart":
                                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                                    break;
                                case "tds":
                                    break;
                                case "activeheat":
                                    break;
                                case "meteo":
                                    let meteoInfo: Meteo = {
                                        air_temperature: event[1],
                                        wind: event[2],
                                        weather: event[3],
                                        snow_condition: event[4],
                                        snow_temperature: event[5],
                                        humidity: event[6]
                                    };
                                    actions.push(new UpdateMeteoAction(meteoInfo));
                                    break;
                                case "palmier":
                                    break;
                                case "message":
                                    actions.push(new SetRaceMessageAction(event[1]));
                                    break;
                                case "reloadmain":
                                    return Observable.of(new ResetAction(), new LoadMainAction(null));
                            }
                        });
                    }

                    return Observable.of(...actions, new LoadUpdateAction());
                })
                .catch((error) => {
                    console.log(error);
                    return Observable.of(new LoadServerErrorAction())
                })
            }
        );
}
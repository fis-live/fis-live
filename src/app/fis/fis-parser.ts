import { AddIntermediateAction, AddStartListAction, RegisterResultAction } from '../state/actions/';
import { Action } from '@ngrx/store';
import {
    SetStatusAction, UpdateMeteoAction, SetRaceMessageAction, UpdateRaceInfoAction,
    AddRacerAction
} from '../state/actions/race';
import { ResetAction, LoadMainAction, StopUpdateAction } from '../state/actions/connection';
import { Meteo } from '../models/meteo';
import { RaceInfo } from '../models/race-info';
import { BATCH_ACTION } from '../state/reducers/index';

export function parseMain(data: any): Action[] {
    const actions: Action[] = [];
    const raceInfo: RaceInfo = {
        eventName: data.raceinfo[0],
        raceName: data.raceinfo[1],
        slopeName: data.raceinfo[2],
        discipline: data.raceinfo[3].toUpperCase(),
        gender: data.raceinfo[4].toUpperCase(),
        category: data.raceinfo[5].toUpperCase(),
        place: data.raceinfo[6],
        temperatureUnit: data.raceinfo[7],
        lengthUnit: data.raceinfo[8],
        speedUnit: data.raceinfo[9],
        team: data.raceinfo[13],
        tds: data.raceinfo[14]
    };
    if (raceInfo.temperatureUnit.length === 1) {
        raceInfo.temperatureUnit = '°' + raceInfo.temperatureUnit;
    }
    if (raceInfo.lengthUnit == null) {
        raceInfo.lengthUnit = 'meters';
    }
    if (raceInfo.speedUnit == null) {
        raceInfo.speedUnit = 'kmh';
    }

    const meteo: Meteo = {
        air_temperature: data.meteo[0],
        wind: data.meteo[1],
        weather: data.meteo[2],
        snow_condition: data.meteo[3],
        snow_temperature: data.meteo[4],
        humidity: data.meteo[5]
    };

    actions.push(new UpdateRaceInfoAction(raceInfo));
    actions.push(new SetRaceMessageAction(data.message));
    actions.push(new UpdateMeteoAction(meteo));
    actions.push(new AddIntermediateAction({key: -1, id: 0, distance: null, name: 'Start list'}));

    data.racedef.forEach((def, index) => {
        let name = 'Finish';
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
                    firstName: data.racers[i][3].trim(),
                    lastName: data.racers[i][2].trim().split(' ').map(char => char[0] + char.substr(1).toLowerCase()).join(' '),
                    nationality:  data.racers[i][4],
                    isFavorite: false,
                    color: ''
                })
            );
        }
    }

    for (let i = 0; i < data.startlist.length; i++) {
        if (data.startlist[i] !== null) {
            actions.push(
                new AddStartListAction({
                    racer: data.startlist[i][0],
                    status: data.startlist[i][1],
                    order: i + 1
                })
            );
            let key = 0;
            const maxVal = 1000000000;
            switch (data.startlist[i][1]) {
                case '':
                case 'start':
                case 'ff':
                case 'q':
                case 'lucky':
                case 'nextstart':
                case 'finish':
                    break;
                case 'ral':
                    key = maxVal + 1;
                    break;
                case 'lapped':
                    key = maxVal * 2;
                    break;
                case 'dnf':
                    key = maxVal * 3;
                    break;
                case 'dq':
                    key = maxVal * 4;
                    break;
                case 'dns':
                    key = maxVal * 5;
                    break;
                default:
                    key = 0;
            }
            if (key > maxVal) {
                actions.push(
                    new RegisterResultAction({
                        status: data.startlist[i][1],
                        intermediate: 99,
                        racer: data.startlist[i][0],
                        time: key
                    })
                );
            }
        }
    }

    for ( let i = 0; i < data.result.length; i++ ) {
        if (data.result[i]) {
            for ( let j = 0; j < data.result[i].length; j++) {
                actions.push(
                    new RegisterResultAction({status: '', intermediate: data.racedef[j][1], racer: i, time: data.result[i][j]})
                );
            }
        }
    }

    return [{type: BATCH_ACTION, payload: actions}];
}

export function parseUpdate(data: any): Action[] {
    const actions = [];
    let reload = false;
    let stopUpdating = true;
    const maxVal = 1000000000;

    if (data.events) {
        data.events.forEach((event) => {
            let key = 0;
            switch (event[0]) {
                case 'inter':
                    actions.push(new RegisterResultAction({
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }));
                    break;
                case 'finish':
                    actions.push(new RegisterResultAction({
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }));
                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                    break;
                case 'dnf':
                    key = maxVal * 3;
                    break;
                case 'dns':
                    key = maxVal * 5;
                    break;
                case 'dq':
                    key = maxVal * 4;
                    break;
                case 'ral':
                    key = maxVal + 1;
                    break;
                case 'lapped':
                    key = maxVal * 2;
                    break;
                case 'q':
                case 'nq':
                case 'lucky':
                case 'ff':
                case 'start':
                case 'nextstart':
                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                    actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                    break;
                case 'meteo':
                    actions.push(new UpdateMeteoAction({
                        air_temperature: event[1],
                        wind: event[2],
                        weather: event[3],
                        snow_condition: event[4],
                        snow_temperature: event[5],
                        humidity: event[6]
                    }));
                    break;
                case 'palmier':
                case 'tds':
                case 'falsestart':
                case 'activeheat':
                    break;
                case 'message':
                    actions.push(new SetRaceMessageAction(event[1]));
                    break;
                case 'reloadmain':
                    reload = true;
                    break;
                case 'official_result':
                    stopUpdating = false;
            }

            if (key > maxVal) {
                actions.push(new SetStatusAction({id: event[2], status: event[0]}));
                actions.push(
                    new RegisterResultAction({
                        status: event[0],
                        intermediate: 99,
                        racer: event[2],
                        time: key
                    })
                );
            }
        });
    }


    return reload ? [new ResetAction(), new LoadMainAction(null)] :
        stopUpdating ? [{type: BATCH_ACTION, payload: actions}, new StopUpdateAction()] : [{type: BATCH_ACTION, payload: actions}];
}

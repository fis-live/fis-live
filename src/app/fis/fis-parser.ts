import { Action } from '@ngrx/store';

import { Meteo } from '../models/meteo';
import { RaceInfo } from '../models/race-info';
import { Batch, LoadMain, StopUpdate } from '../state/actions/connection';
import { SetRaceMessage, UpdateMeteo, UpdateRaceInfo } from '../state/actions/info';
import { AddIntermediate, AddRacer, AddStartList, RegisterResult, SetStatus } from '../state/actions/race';

import { nationalities, statusMap, statusToTimeMap } from './fis-constants';
import { Main, Update } from './models';

export function parseMain(data: Main): Action[] {
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
        snow_temperature: data.meteo[3],
        humidity: data.meteo[4],
        snow_condition: data.meteo[5]
    };

    actions.push(new UpdateRaceInfo(raceInfo));
    actions.push(new SetRaceMessage(data.message));
    actions.push(new UpdateMeteo(meteo));
    actions.push(new AddIntermediate({key: 0, id: 0, distance: 0, name: 'Start list'}));

    data.racedef.forEach((def, index) => {
        let name = 'Finish';
        if (def[0] === 'inter') {
            name = '';
        }

        if (def[2] && def[2] > 0) {
            name += ' ' + def[2] + ' ' + raceInfo.lengthUnit.toUpperCase();
            name = name.trim();
        }

        actions.push(new AddIntermediate({key: index + 1, id: def[1], distance: def[2], name: name}));
    });

    for ( let i = 0; i < data.racers.length; i++ ) {
        const racer = data.racers[i];
        if (racer !== null) {
            actions.push(new AddRacer({
                    id: racer[0],
                    bib: racer[1],
                    firstName: racer[3].trim(),
                    lastName: racer[2].trim().split(' ').map((char) => char[0] + char.substr(1).toLowerCase()).join(' '),
                    nationality:  nationalities[racer[4]] || racer[4],
                    isFavorite: false,
                    color: racer[5]
                })
            );
        }
    }

    for (let i = 0; i < data.startlist.length; i++) {
        if (data.startlist[i] !== null) {
            actions.push(
                new AddStartList({
                    racer: data.startlist[i][0],
                    status: statusMap[data.startlist[i][1]] || data.startlist[i][1] || '',
                    order: i + 1
                })
            );
            switch (data.startlist[i][1]) {
                case 'ral':
                case 'lapped':
                case 'dnf':
                case 'dq':
                case 'dns':
                    actions.push(
                        new RegisterResult({
                            status: statusMap[data.startlist[i][1]] || data.startlist[i][1] || '',
                            intermediate: 99,
                            racer: data.startlist[i][0],
                            time: statusToTimeMap[data.startlist[i][1]]
                        })
                    );
                    break;
            }
        }
    }

    for ( let i = 0; i < data.result.length; i++ ) {
        const res = data.result[i];
        if (res !== null) {
            for ( let j = 0; j < res.length; j++) {
                actions.push(
                    new RegisterResult({status: '', intermediate: data.racedef[j][1], racer: i, time: res[j]})
                );
            }
        }
    }

    return actions;
}

export function parseUpdate(data: Update): Action[] {
    const actions: Action[] = [];
    let reload = false;
    let stopUpdating = false;

    if (data.events) {
        data.events.forEach((event) => {
            switch (event[0]) {
                case 'inter':
                    actions.push(new RegisterResult({
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }, true));
                    break;
                case 'finish':
                    actions.push(new RegisterResult({
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }));
                    actions.push(new SetStatus({id: event[2], status: statusMap[event[0]]}));
                    break;
                case 'dnf':
                case 'dns':
                case 'dq':
                case 'ral':
                case 'lapped':
                    actions.push(
                        new RegisterResult({
                            status: statusMap[event[0]],
                            intermediate: 99,
                            racer: event[2],
                            time: statusToTimeMap[event[0]]
                        })
                    );
                    actions.push(new SetStatus({id: event[2], status: statusMap[event[0]]}));
                    break;
                case 'q':
                case 'nq':
                case 'lucky':
                case 'ff':
                case 'start':
                case 'nextstart':
                    actions.push(new SetStatus({id: event[2], status: statusMap[event[0]]}));
                    break;
                case 'meteo':
                    actions.push(new UpdateMeteo({
                        air_temperature: event[1],
                        wind: event[2],
                        weather: event[3],
                        snow_condition: event[4],
                        snow_temperature: event[5],
                        humidity: event[6]
                    }));
                    break;
                case 'message':
                    actions.push(new SetRaceMessage(event[1]));
                    break;
                case 'reloadmain':
                    reload = true;
                    break;
                case 'official_result':
                    stopUpdating = true;
                    break;

                case 'palmier':
                case 'tds':
                case 'falsestart':
                case 'activeheat':
                default:
                    console.log('Unknown event:', event);
                    break;
            }
        });
    }

    const batch = actions.length ? [new Batch(actions)] : [];

    return reload ? [new LoadMain(null)] :
        stopUpdating ? [...batch, new StopUpdate()] : batch;
}

import { Action } from '@ngrx/store';

import { Meteo } from '../models/meteo';
import { RaceInfo } from '../models/race-info';
import { batch, loadMain, stopUpdate } from '../state/actions/connection';
import { setRaceMessage, updateMeteo, updateRaceInfo } from '../state/actions/info';
import { addIntermediate, addRacer, addStartList, registerResult, setStatus } from '../state/actions/race';

import { nationalities, statusMap, statusToTimeMap } from './fis-constants';
import { Main, Update } from './models';

function fixEncoding(str: string) {
    try {
        return decodeURIComponent(escape(str));
    } catch (e) {
        return str;
    }
}

function toTitleCase(title: string) {
    const small = /^(von|van|der|of|de|del|di|do|af|den)$/i;
    const large = /^(I|II|III|IV)$/i;

    return title.split(/([ -])/).map(function (current) {
        if (current.search(small) > -1) {
            return current.toLowerCase();
        }

        if (current.search(large) > -1) {
            return current.toUpperCase();
        }

        return current.substr(0, 1).toUpperCase() + current.substr(1).toLowerCase();
    }).join('');
}

export function parseMain(data: Main): Action[] {
    const actions: Action[] = [];
    const raceInfo: RaceInfo = {
        eventName: fixEncoding(data.raceinfo[0]),
        raceName: fixEncoding(data.raceinfo[1]),
        slopeName: fixEncoding(data.raceinfo[2]),
        discipline: data.raceinfo[3].toUpperCase(),
        gender: data.raceinfo[4].toUpperCase(),
        category: data.raceinfo[5].toUpperCase(),
        place: fixEncoding(data.raceinfo[6]),
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
        raceInfo.lengthUnit = 'm';
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

    actions.push(updateRaceInfo({raceInfo}));
    actions.push(setRaceMessage({message: data.message}));
    actions.push(updateMeteo({meteo}));
    actions.push(addIntermediate({
        intermediate: {type: 'start_list', key: 0, id: 0, distance: 0, name: 'Start list', short: '0 ' + raceInfo.lengthUnit}
    }));

    data.racedef.forEach((def, index) => {
        let name: string;
        let type: 'start_list' | 'inter' | 'finish' | 'bonus_points';
        let short: string;
        switch (def[0]) {
            case 'inter':
                type = 'inter';
                if (def[2] && def[2] > 0) {
                    name = short = def[2] + ' ' + raceInfo.lengthUnit;
                } else {
                    name = short = 'Inter ' + (index + 1);
                }
                break;
            case 'bonuspoint':
                type = 'bonus_points';
                if (def[2] && def[2] > 0) {
                    name = 'Bonus points at ' + def[2] + ' ' + raceInfo.lengthUnit;
                    short = 'Bonus ' + def[2] + ' ' + raceInfo.lengthUnit;
                } else {
                    name = short = 'Bonus points';
                }
                break;
            case 'finish':
                type = 'finish';
                if (def[2] && def[2] > 0) {
                    name = 'Finish ' + def[2] + ' ' + raceInfo.lengthUnit;
                    short = def[2] + ' ' + raceInfo.lengthUnit;
                } else {
                    name = short = 'Finish';
                }
                break;
            default:
                type = 'inter';
                if (def[2] && def[2] > 0) {
                    name = short = def[2] + ' ' + raceInfo.lengthUnit;
                } else {
                    name = short = 'Inter ' + (index + 1);
                }
                break;
        }

        actions.push(addIntermediate({intermediate: {key: index + 1, id: def[1], distance: def[2], name, short, type}}));
    });

    for ( let i = 0; i < data.racers.length; i++ ) {
        const racer = data.racers[i];
        if (racer !== null) {
            actions.push(addRacer({racer: {
                    id: racer[0],
                    bib: racer[1],
                    firstName: fixEncoding(racer[3].trim()),
                    lastName: toTitleCase(fixEncoding(racer[2].trim())),
                    nsa:  nationalities[racer[4]] || racer[4],
                    isFavorite: false,
                    color: racer[5]
                }})
            );
        }
    }

    for (let i = 0; i < data.startlist.length; i++) {
        if (data.startlist[i] !== null) {
            actions.push(
                addStartList({entry: {
                    racer: data.startlist[i][0],
                    status: statusMap[data.startlist[i][1]] || data.startlist[i][1] || '',
                    order: i + 1
                }})
            );
            switch (data.startlist[i][1]) {
                case 'ral':
                case 'lapped':
                case 'dnf':
                case 'dq':
                case 'dsq':
                case 'dns':
                    actions.push(
                        registerResult({result: {
                            status: statusMap[data.startlist[i][1]] || data.startlist[i][1] || '',
                            intermediate: 99,
                            racer: data.startlist[i][0],
                            time: statusToTimeMap[data.startlist[i][1]]
                        }, isEvent: false, timestamp: 0})
                    );
                    break;
            }
        }
    }

    for ( let i = 0; i < data.result.length; i++ ) {
        const res = data.result[i];
        if (res !== null) {
            for (let j = 0; j < res.length; j++) {
                if (res[j]) {
                    actions.push(
                        registerResult(
                            {isEvent: false, timestamp: 0, result: {status: '', intermediate: data.racedef[j][1], racer: i, time: res[j]}})
                    );
                }
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
                case 'bonuspoint':
                    actions.push(registerResult({result: {
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }, isEvent: true, timestamp: Date.now()}));
                    break;
                case 'finish':
                    actions.push(registerResult({result: {
                        status: '', intermediate: event[3], racer: event[2], time: event[4]
                    }, isEvent: false, timestamp: 0}));
                    actions.push(setStatus({status: {id: event[2], status: statusMap[event[0]]}}));
                    break;
                case 'dnf':
                case 'dns':
                case 'dq':
                case 'ral':
                case 'lapped':
                    actions.push(
                        registerResult({result: {
                            status: statusMap[event[0]],
                            intermediate: 99,
                            racer: event[2],
                            time: statusToTimeMap[event[0]]
                        }, isEvent: false, timestamp: 0})
                    );
                    actions.push(setStatus({status: {id: event[2], status: statusMap[event[0]]}}));
                    break;
                case 'q':
                case 'nq':
                case 'lucky':
                case 'ff':
                case 'start':
                case 'nextstart':
                    actions.push(setStatus({status: {id: event[2], status: statusMap[event[0]]}}));
                    break;
                case 'meteo':
                    actions.push(updateMeteo({meteo: {
                        air_temperature: event[1],
                        wind: event[2],
                        weather: event[3],
                        snow_condition: event[4],
                        snow_temperature: event[5],
                        humidity: event[6]
                    }}));
                    break;
                case 'message':
                    actions.push(setRaceMessage({message: event[1]}));
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

    const batched = actions.length ? [batch({actions})] : [];

    return reload ? [loadMain({codex: null})] :
        stopUpdating ? [...batched, stopUpdate()] : batched;
}

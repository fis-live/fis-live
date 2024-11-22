import { fixEncoding, toTitleCase } from '../../utils/utils';
import { nationalities } from '../fis-constants';
import { Meteo } from '../shared';

import { MeteoEventArray, NoteEventArray, ResultEventArray, RunEventArray } from './api/event-types';
import { MainArray, MeteoArray, RaceInfoArray, RacerArray, UpdateArray } from './api/types';
import { Intermediate, RaceInfo, Racer } from './models';
import { Main, NoteEvent, ResultEvent, RunEvent, Update } from './types';


export class Adapter {
    private static createRacer(racer: RacerArray, isFavorite: boolean, sector: 'cc' | 'nk'): Racer {
        const firstName = toTitleCase(fixEncoding(racer[3]?.toString()?.trim() ?? ''));
        const lastName = toTitleCase(fixEncoding(racer[2]?.toString()?.trim() ?? ''));
        const initials = firstName.split(/([ -])/).map(str => str[0]).join('').replace(' ', '.');

        return {
            id: racer[0],
            bib: racer[1],
            firstName,
            lastName,
            display: firstName !== '' ? firstName + ' ' + lastName : lastName,
            value: (firstName !== '' ? lastName + ', ' + firstName : lastName).toLowerCase(),
            short: initials !== '' ? initials + '. ' + lastName : lastName,
            nsa: nationalities[racer[4]] || racer[4],
            isFavorite: isFavorite,
            hasYellowCard: racer[6] === 'yc',
            color: racer[5],
            sector: sector
        };
    }

    private static createRaceInfo(info: RaceInfoArray): RaceInfo {
        return {
            eventName: fixEncoding((typeof info[0] === 'string' ? info[0] : '')),
            raceName: fixEncoding((typeof info[1] === 'string' ? info[1] : '')),
            slopeName: fixEncoding((typeof info[2] === 'string' ? info[2] : '')),
            discipline: (typeof info[3] === 'string' ? info[3] : '').toUpperCase(),
            gender: (typeof info[4] === 'string' ? info[4] : '').toUpperCase(),
            category: (typeof info[5] === 'string' ? info[5] : '').toUpperCase(),
            place: fixEncoding((typeof info[6] === 'string' ? info[6] : '')),
            temperatureUnit: (typeof info[7] === 'string' ? info[7] : 'C'),
            lengthUnit: (typeof info[8] === 'string' ? info[8] : 'km'),
            speedUnit: (typeof info[9] === 'string' ? info[9] : 'kmh'),
            team: info[13],
            tds: info[14]
        };
    }

    private static createMeteo(meteo: MeteoArray | MeteoEventArray): Meteo {
        let i = meteo[0] === 'meteo' ? 1 : 0;

        return {
            air_temperature: meteo[i++],
            wind: meteo[i++],
            weather: meteo[i++],
            snow_temperature: meteo[i++],
            humidity: meteo[i++],
            snow_condition: meteo[i++]
        } as Meteo;
    }

    private static resultEvent(event: ResultEventArray): ResultEvent {
        return {
            type: event[0],
            run: event[1],
            bib: event[2],
            inter: event[3],
            time: event[4],
            precision: event[9]
        };
    }

    private static noteEvent(event: NoteEventArray): NoteEvent {
        return {
            type: event[0],
            run: event[1],
            bib: event[2]
        };
    }

    private static runEvent(event: RunEventArray): RunEvent {
        return {
            type: event[0],
            run: event[1]
        };
    }


    static parseMain(main: MainArray, favorites: Racer[], sector: 'cc' | 'nk'): Main {
        const raceInfo = this.createRaceInfo(main.raceinfo);
        const meteo = this.createMeteo(main.meteo);

        const intermediates: Intermediate[] = [];
        const resultKeys: number[] = [];
        const racers: Racer[] = [];

        intermediates.push({type: 'start_list', key: 0, id: 0, distance: 0, name: 'Start list', short: '0 ' + raceInfo.lengthUnit});

        if (main.racedef.length === 0) {
            intermediates.push({type: 'finish', key: 1, id: 99, distance: 0, name: 'Finish', short: 'Finish'});
            resultKeys.push(99);
        }

        for (const def of main.racedef) {
            const index = main.racedef.indexOf(def);
            let name: string;
            let type: 'start_list' | 'inter' | 'finish' | 'bonus_points' | 'bonus_time' | 'standing';
            let short: string;
            const [_type, id, distanceOrName] = def;
            resultKeys.push(id);

            switch (_type) {
                case 'inter':
                    type = 'inter';
                    if (distanceOrName && +distanceOrName > 0) {
                        name = short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + id;
                    }
                    break;
                case 'bonuspoint':
                    type = 'bonus_points';
                    if (distanceOrName && +distanceOrName > 0) {
                        name = 'Bonus points at ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = 'Bonus ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Bonus points';
                    }
                    break;
                case 'bonustime':
                    type = 'bonus_time';
                    if (distanceOrName && +distanceOrName > 0) {
                        name = 'Bonus time at ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = 'Bonus ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Bonus time';
                    }
                    break;
                case 'finish':
                    type = 'finish';
                    if (distanceOrName && +distanceOrName > 0) {
                        name = 'Finish ' + distanceOrName + ' ' + raceInfo.lengthUnit;
                        short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Finish';
                    }
                    break;
                case 'standing':
                    type = 'standing';
                    if (distanceOrName) {
                        name = short = '' + distanceOrName;
                    } else {
                        name = short = 'Standing';
                    }
                    break;
                default:
                    type = 'inter';
                    if (distanceOrName && +distanceOrName > 0) {
                        name = short = distanceOrName + ' ' + raceInfo.lengthUnit;
                    } else {
                        name = short = 'Inter ' + id;
                    }
                    break;
            }

            if (_type !== 'start') {
                intermediates.push({key: index + 1, id: id, distance: +distanceOrName!, name, short, type});
            }
        }

        for (const racer of main.racers) {
            if (racer !== null) {
                racers.push(this.createRacer(racer, !!favorites.find((it) => it.id === racer[0]), sector));
            }
        }

        return {
            raceInfo,
            meteo,
            intermediates,
            racers,
            startList: main.startlist,
            results: main.result,
            runInfo: main.runinfo,
            runNo: main.runno,
            tabrunsprec: main.tabrunsprec,
            message: main.message || '',
            live: main.live,
            main: main.main,
            resultKeys
        };
    }

    static parseUpdate(update: UpdateArray): Update {
        const events: Update['events'] = [];
        let reload = false;

        if (update.events) {
            for (const event of update.events) {
                switch (event[0]) {
                    case 'inter':
                    case 'bonuspoint':
                    case 'bonustime':
                    case 'standing':
                    case 'finish':
                        events.push(this.resultEvent(event));
                        break;
                    case 'sanction':
                    case 'dnf':
                    case 'dns':
                    case 'dq':
                    case 'dsq':
                    case 'ral':
                    case 'nps':
                    case 'lapped':
                    case 'q':
                    case 'nq':
                    case 'currentlucky':
                    case 'lucky':
                    case 'ff':
                    case 'start':
                    case 'nextstart':
                        events.push(this.noteEvent(event));
                        break;
                    case 'meteo':
                        events.push({
                            type: 'meteo',
                            meteo: this.createMeteo(event)
                        });
                        break;
                    case 'message':
                        events.push({
                            type: 'message',
                            message: event[1] || ''
                        });
                        break;
                    case 'reloadmain':
                    case 'reloadflash':
                        reload = true;
                        break;

                    case 'activeheat':
                    case 'activerun':
                        events.push({
                            type: event[0],
                            run: event[1]
                        });
                        break;

                    case 'tobeat':
                    case 'official_result':
                    case 'unofficial_result':
                    case 'rundef':
                    case 'startlist':
                    case 'inprogress':
                    default:
                        console.log('Unhandled event:', event);
                        break;
                }
            }
        }

        return {
            events,
            live: update.live,
            reload: reload || !!update.reload,
            runNo: update.runno
        };
    }
}

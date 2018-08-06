import { Action } from '@ngrx/store';

import { Meteo } from '../../models/meteo';
import { RaceInfo } from '../../models/race-info';

export const enum InfoActionTypes {
    UpdateRaceInfo = '[Info] Update race info',
    SetRaceMessage = '[Info] Set message',
    UpdateMeteo = '[Info] Update meteo',
}

export class UpdateRaceInfo implements Action {
    readonly type = InfoActionTypes.UpdateRaceInfo;

    constructor(public raceInfo: Partial<RaceInfo>) { }
}

export class SetRaceMessage implements Action {
    readonly type = InfoActionTypes.SetRaceMessage;

    constructor(public message: string) { }
}

export class UpdateMeteo implements Action {
    readonly type = InfoActionTypes.UpdateMeteo;

    constructor(public meteo: Partial<Meteo>) { }
}


export type InfoAction
    = UpdateRaceInfo
    | SetRaceMessage
    | UpdateMeteo;

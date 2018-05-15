import { Action } from '@ngrx/store';

import { Racer } from '../../models/racer';

export const enum SettingsActionTypes {
    ToggleFavorite = '[Settings] Toggle favorite',
    SetDelay = '[Settings] Set delay',
    Reset = '[Settings] Reset settings'
}

export class ToggleFavorite implements Action {
    readonly type = SettingsActionTypes.ToggleFavorite;

    constructor(public payload: Racer) { }
}

export class SetDelay implements Action {
    readonly type = SettingsActionTypes.SetDelay;

    constructor(public payload: number) { }
}

export class ResetSettings implements Action {
    readonly type = SettingsActionTypes.Reset;

    constructor() { }
}

export type SettingsAction
    = ToggleFavorite
    | SetDelay
    | ResetSettings;

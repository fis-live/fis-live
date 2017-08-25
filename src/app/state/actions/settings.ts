import { Action } from '@ngrx/store';
import { Racer } from '../../models/racer';


export const TOGGLE_FAVORITE = '[Settings] Toggle favorite';
export const SET_DELAY = '[Settings] Set delay';
export const RESET = '[Settings] Reset settings';

export class ToggleFavorite implements Action {
    readonly type = TOGGLE_FAVORITE;

    constructor(public payload: Racer) { }
}

export class SetDelay implements Action {
    readonly type = SET_DELAY;

    constructor(public payload: number) { }
}

export class ResetSettings implements Action {
    readonly type = RESET;

    constructor() { }
}

export type SettingsAction
    = ToggleFavorite
    | SetDelay
    | ResetSettings;

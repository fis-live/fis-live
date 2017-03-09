import { Action } from '@ngrx/store';
import { Racer } from '../../models/racer';

export const SettingsActions = {
    TOGGLE_FAVORITE: '[Settings] Toggle favorite',
    SET_DELAY: '[Settings] Set delay'
};

export class ToggleFavoriteAction implements Action {
    type = SettingsActions.TOGGLE_FAVORITE;

    constructor(public payload: Racer) {
    }
}

export class SetDelayAction implements Action {
    type = SettingsActions.SET_DELAY;

    constructor(public payload: number) {
    }
}

import { Action } from '@ngrx/store';
import { Racer } from '../../models/racer';

export const SettingsActions = {
    TOGGLE_FAVORITE: '[Settings] Toggle favorite'
};

export class ToggleFavoriteAction implements Action {
    type = SettingsActions.TOGGLE_FAVORITE;

    constructor(public payload: Racer) {
    }
}

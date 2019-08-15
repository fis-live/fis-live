import { createAction, props } from '@ngrx/store';

import { Racer } from '../../models/racer';

export const toggleFavorite = createAction(
    '[Settings] Toggle favorite',
    props<{racer: Racer}>()
);

export const setDelay = createAction(
    '[Settings] Set delay',
    props<{delay: number}>()
);

export const resetSettings = createAction(
    '[Settings] Reset settings'
);

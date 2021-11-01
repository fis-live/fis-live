import { createAction, props } from '@ngrx/store';

import { Racer } from '../../fis/cross-country/models';

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

export const toggleTicker = createAction(
    '[Settings] Toggle ticker'
);

export const toggleColumn = createAction(
    '[Settings] Toggle column',
    props<{column: string}>()
);

export const reorderColumn = createAction(
    '[Settings] Reorder column',
    props<{previousIndex: number, currentIndex: number}>()
);

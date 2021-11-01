import { createAction, props } from '@ngrx/store';

import { PdfData } from '../../fis/cross-country/models';
import { Main, Update } from '../../fis/cross-country/types';

export const update = createAction(
    '[Result] Parse update',
    props<{ events: Update['events'], timestamp: number }>()
);

export const initialize = createAction(
    '[Result] Parse main',
    props<{ main: Main }>()
);

export const parsePdf = createAction(
    '[Result] Handle pdf data',
    props<{
        racers: PdfData[]
    }>()
);

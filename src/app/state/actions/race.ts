import { createAction, props } from '@ngrx/store';

import { FisEvent, PdfData, Result, StartListEntry } from '../../fis/models';
import { Intermediate } from '../../models/intermediate';
import { Racer } from '../../models/racer';

export const update = createAction(
    '[Result] Parse update',
    props<{ events: FisEvent[], isEvent: boolean, timestamp: number }>()
);

export const initialize = createAction(
    '[Result] Parse main',
    props<{
        intermediates: Intermediate[],
        racers: Racer[],
        startList: {
            [bib: number]: StartListEntry
        },
        results: Result[]
    }>()
);

export const parsePdf = createAction(
    '[Result] Handle pdf data',
    props<{
        racers: PdfData[]
    }>()
);

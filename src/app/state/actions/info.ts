import { createAction, props } from '@ngrx/store';

import { RaceInfo } from '../../fis/cross-country/models';
import { Meteo } from '../../fis/shared';

export const updateRaceInfo = createAction(
    '[Info] Update race info',
    props<{raceInfo: Partial<RaceInfo>}>()
);

export const setRaceMessage = createAction(
    '[Info] Set message',
    props<{message: string}>()
);

export const updateMeteo = createAction(
    '[Info] Update meteo',
    props<{meteo: Partial<Meteo>}>()
);

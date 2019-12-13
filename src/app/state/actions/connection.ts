import { Action, createAction, props } from '@ngrx/store';

import { Alert } from '../../models/alert';
import { Race } from '../../models/race';
import { DelayBehavior } from '../../utils/queue';

export const loadServers = createAction(
    '[Connection] Load servers'
);

export const showAlert = createAction(
    '[Alert] Show alert',
    props<{alert: Alert}>()
);

export const reset = createAction(
    '[Connection] Reset state'
);

export const loadMain = createAction(
    '[Connection] Load main',
    props<{codex: number | null}>()
);

export const loadCalendar = createAction(
    '[Connection] Load calendar'
);

export const setCalendar = createAction(
    '[Connection] Set calendar',
    props<{races: Race[]}>()
);

export const closeAlert = createAction(
    '[Alert] Close alert'
);

export const batch = createAction(
    '[Connection] Batch action',
    props<{actions: Action[], shouldDelay?: DelayBehavior}>()
);

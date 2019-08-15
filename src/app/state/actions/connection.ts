import { Action, createAction, props } from '@ngrx/store';

import { Alert } from '../../models/alert';
import { Race } from '../../models/race';

export const loadServers = createAction(
    '[Connection] Load servers'
);

export const selectServer = createAction(
    '[Connection] Select server'
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

export const loadPdf = createAction(
    '[Connection] Load pdf',
    props<{doc: string}>()
);

export const loadUpdate = createAction(
    '[Connection] Load update'
);

export const loadCalendar = createAction(
    '[Connection] Load calendar'
);

export const setCalendar = createAction(
    '[Connection] Set calendar',
    props<{races: Race[]}>()
);

export const stopUpdate = createAction(
    '[Connection] Stop updating'
);

export const closeAlert = createAction(
    '[Alert] Close alert'
);

export const batch = createAction(
    '[Connection] Batch action',
    props<{actions: Action[]}>()
);

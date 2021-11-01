import { createAction, props } from '@ngrx/store';

import { Race } from '../../fis/shared';
import { Alert } from '../reducers/alert';

export const loadServers = createAction(
    '[Connection] Load servers'
);

export const showAlert = createAction(
    '[Alert] Show alert',
    props<{alert: Alert}>()
);

export const loadMain = createAction(
    '[Connection] Load main',
    props<{codex: number, sectorCode: 'cc' | 'nk'}>()
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

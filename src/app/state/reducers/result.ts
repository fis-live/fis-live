import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as RaceActions from '../actions/race';
import { maxVal } from '../../fis/fis-constants';

export interface RacerData {
    id: number;
    order: number;
    status: string;
    times: number[];
}

export interface State extends EntityState<RacerData> {
    history: {racer: number; intermediate: number}[];
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({history: []});

export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
    switch (action.type) {
        case RaceActions.ADD_START_LIST:
            return adapter.addOne({
                id: action.payload.racer,
                status: action.payload.status,
                order: action.payload.order,
                times: [0]
            }, state);

        case RaceActions.SET_START_TIME:
            const times = state.entities[action.payload.racer].times.slice();
            times[0] = action.payload.time;

            return adapter.updateOne({id: action.payload.racer, changes: {times}}, state);

        case RaceActions.SET_STATUS:
            return adapter.updateOne({id: action.payload.id, changes: {status: action.payload.status}}, state);

        case RaceActions.REGISTER_RESULT:
            const item = action.payload;
            const time = item.time || maxVal * 6;
            const _times = state.entities[action.payload.racer].times.slice();
            if (_times.length < item.intermediate) {
                const l = _times.length;
                const t = (time < maxVal) ? maxVal * 6 : time;
                _times[item.intermediate] = time;
                _times.fill(t, l, item.intermediate);
            } else {
                _times.push(time);
            }

            return adapter.updateOne({id: action.payload.racer, changes: {times: _times}}, state);

        default:
            return state;
    }
}

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
    history: {racer: number; intermediate: number; isUpdate: boolean; prev?: number}[];
    interMap: {[id: number]: number};
}

export const adapter: EntityAdapter<RacerData> = createEntityAdapter<RacerData>();

export const initialState: State = adapter.getInitialState({history: [], interMap: {}});

export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
    switch (action.type) {
        case RaceActions.ADD_INTERMEDIATE:
            return {...state, interMap: {...state.interMap, [action.payload.id]: action.payload.key}};

        case RaceActions.ADD_START_LIST:
            return {...adapter.addOne({
                id: action.payload.racer,
                status: action.payload.status,
                order: action.payload.order,
                times: [0]
            }, state), history: state.history.concat({racer: action.payload.racer, intermediate: 0, isUpdate: false})};

        case RaceActions.SET_START_TIME:
            const times = state.entities[action.payload.racer].times.slice();
            times[0] = action.payload.time;

            return {...adapter.updateOne({id: action.payload.racer, changes: {times}}, state),
                history: state.history.concat({racer: action.payload.racer, intermediate: 0, isUpdate: true})};

        case RaceActions.SET_STATUS:
            return {...adapter.updateOne({id: action.payload.id, changes: {status: action.payload.status}}, state),
                history: state.history.concat({racer: action.payload.id, intermediate: 0, isUpdate: true})};

        case RaceActions.REGISTER_RESULT:
            const item = action.payload;
            const inter = state.interMap[item.intermediate];
            const time = item.time || maxVal * 6;
            const _times = state.entities[action.payload.racer].times.slice();
            const history = [];
            if (_times.length !== inter) {
                if (_times.length < inter) {
                    const t = (time < maxVal) ? maxVal * 6 : time;
                    _times[inter] = time;
                    history.push({racer: item.racer, intermediate: inter, isUpdate: false});
                    for (let i = 0; i < _times.length; i++) {
                        if (_times[i] === undefined) {
                            _times[i] = t;
                            history.push({racer: item.racer, intermediate: i, isUpdate: false});
                        }
                    }
                } else {
                    const t = _times[inter];
                    _times[inter] = time;
                    history.push({racer: item.racer, intermediate: inter, isUpdate: true, prev: t});
                }
            } else {
                _times[inter] = time;
                history.push({racer: item.racer, intermediate: inter, isUpdate: false});
            }

            return {...adapter.updateOne({id: action.payload.racer, changes: {times: _times}}, state),
                history: state.history.concat(history)};

        default:
            return state;
    }
}

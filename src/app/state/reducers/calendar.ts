import { Action, createReducer, on } from '@ngrx/store';

import { Race, RacesByPlace } from '../../models/race';
import { ConnectionActions } from '../actions';

export type State = Race[];

const initialState: State = [];

const calendarReducer = createReducer(
    initialState,
    on(ConnectionActions.setCalendar, (_state, { races }) => races)
);

export function reducer(state: State | undefined, action: Action) {
    return calendarReducer(state, action);
}

export const getRacesByPlace = (state: State) => {
    const ret: RacesByPlace[] = [];
    state.forEach((race) => {
        if (ret.length > 5) {
            return;
        }

        const i = ret.findIndex((row) => row.date === race.date);
        if (i === -1) {
            ret.push({
                liveCount: race.status === 'Live' ? 1 : 0,
                date: race.date,
                places: [{place: race.place, races: [race]}]
            });
        } else {
            const j = ret[i].places.findIndex((row) => row.place === race.place);
            if (j === -1) {
                ret[i].places.push({place: race.place, races: [race]});
            } else {
                ret[i].places[j].races.push(race);
            }
            ret[i].liveCount += race.status === 'Live' ? 1 : 0;
        }
    });

    return ret;
};

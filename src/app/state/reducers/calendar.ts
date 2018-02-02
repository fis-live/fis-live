import { Race } from '../../models/race';
import * as ConnectionActions from '../actions/connection';

export type State = Race[];

export function reducer(state: State = [], action: ConnectionActions.ConnectionAction): State {
    switch (action.type) {
        case ConnectionActions.SET_CALENDAR:
            return action.payload;

        default:
            return state;
    }
}

export const getRacesByPlace = (state: State) => {
    const ret = [];
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

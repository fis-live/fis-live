import * as RaceActions from '../actions/race';
import { RaceInfo } from '../../models/race-info';
import { Meteo } from '../../models/meteo';

export interface State {
    info: RaceInfo;
    meteo: Meteo;
    message: string;
}

const initialState: State = {
    info: {
        eventName: '',
        raceName: '',
        slopeName: '',
        discipline: '',
        gender: '',
        category: '',
        place: '',
        temperatureUnit: '',
        lengthUnit: '',
        speedUnit: '',
        team: '',
        tds: ''
    },
    meteo: {
        air_temperature: null,
        wind: '',
        weather: '',
        snow_condition: '',
        snow_temperature: null,
        humidity: null
    },
    message: ''
};


export function reducer(state: State = initialState, action: RaceActions.RaceAction): State {
    switch (action.type) {
        case RaceActions.UPDATE_RACE_INFO:
            const info = action.payload;

            return {
                info: Object.assign({}, state.info, info),
                meteo: state.meteo,
                message: state.message
            };

        case RaceActions.SET_RACE_MESSAGE:
            const message: string = action.payload;

            return {
                info: state.info,
                meteo: state.meteo,
                message: message
            };

        case RaceActions.UPDATE_METEO:
            const meteo = action.payload;

            return {
                info: state.info,
                meteo: Object.assign({}, state.meteo, meteo),
                message: state.message
            };


        default:
            return state;
    }
}

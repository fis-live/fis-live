import { Meteo } from '../../models/meteo';
import { RaceInfo } from '../../models/race-info';
import { InfoAction, InfoActionTypes } from '../actions/info';

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


export function reducer(state: State = initialState, action: InfoAction): State {
    switch (action.type) {
        case InfoActionTypes.UpdateRaceInfo:
            return {
                info: {...state.info, ...action.raceInfo},
                meteo: state.meteo,
                message: state.message
            };

        case InfoActionTypes.SetRaceMessage:
            return {
                info: state.info,
                meteo: state.meteo,
                message: action.message
            };

        case InfoActionTypes.UpdateMeteo:
            return {
                info: state.info,
                meteo: {...state.meteo, ...action.meteo},
                message: state.message
            };

        default:
            return state;
    }
}

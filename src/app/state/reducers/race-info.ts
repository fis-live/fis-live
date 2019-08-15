import { Action, createReducer, on } from '@ngrx/store';

import { Meteo } from '../../models/meteo';
import { RaceInfo } from '../../models/race-info';
import { InfoActions } from '../actions';

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

const infoReducer = createReducer(
    initialState,
    on(InfoActions.setRaceMessage, (state, { message }) => ({...state, message})),
    on(InfoActions.updateMeteo, (state, { meteo }) => ({
        info: state.info,
        meteo: {...state.meteo, ...meteo},
        message: state.message
    })),
    on(InfoActions.updateRaceInfo, (state, { raceInfo }) => ({
        info: {...state.info, ...raceInfo},
        meteo: state.meteo,
        message: state.message
    }))
);

export function reducer(state: State | undefined, action: Action) {
    return infoReducer(state, action);
}

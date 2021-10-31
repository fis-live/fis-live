export type MeteoArray = [
    airTemp: number | null,
    wind: string | null,
    weather: string | null,
    snowTemp: number | null,
    humidity: number | null,
    snowCondition: string | null
];

export type RunNo = [run: number, heat: number | null];

export type RunInfo = [
    run: number,
    name: string,
    stage: number | string,
    toBeat: number | string,
    precision: number | string
];

export type RaceInfoArray = [
    eventName: string,
    raceName: string,
    slopeName: string,
    discipline: string,
    gender: string,
    category: string,
    place: string,
    temperatureUnit: string,
    lengthUnit: string,
    speedUnit: string,
    _ignored: string,
    _ignored: string,
    _ignored: string,
    team: string,
    tds: string
];

export type TabRunsPrec = [
    bib: number,
    note: string,
    time: number,
    lastName: string,
    firstName: string,
    status: string
];

export type Live = [delay: number, next: number, sector: string, _ignored?: number];

export type StartList = [bib: number, note: string | null, order: number, status: string | null, heats?: number | null];

export type RacerArray = [
    id: number,
    bib: number,
    lastName: string | null,
    firstName: string | null,
    nsa: string,
    bibColor: string,
    yc: 'yc' | '',
    status: string,
    time: number | string,
    precision: number | string,
    run: number
];

export type RaceDef = [
    type: 'inter' | 'finish' | 'standing' | 'start' | 'bonuspoint' | 'bonustime',
    id: number,
    distanceOrName: string | number | null,
];

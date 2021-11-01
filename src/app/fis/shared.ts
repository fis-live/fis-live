export interface Meteo {
    air_temperature: number | null;
    wind: string | null;
    weather: string | null;
    snow_condition: string | null;
    snow_temperature: number | null;
    humidity: number | null;
}

export interface Race {
    status: string;
    date: string;
    time: string;
    place: string;
    category: string;
    codex: number;
    discipline: string;
    gender: string;
    nation: string;
    sector: 'nk' | 'cc';
}

export interface RacesByPlace {
    liveCount: number;
    date: string;
    places: [{ place: string; races: Race[] }];
}

export interface RacesByDate {
    date: string;
    races: Race[];
}

export interface ServerList {
    servers: [url: string, weight: number, index: number][];
}

export interface FisServer {
    url: string;
    weight: number;
    index: number;
}

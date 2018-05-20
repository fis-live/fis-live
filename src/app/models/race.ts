export interface Race {
    status: string;
    date: string;
    time: string;
    place: string;
    category: string;
    codex: number;
    discipline: string;
    gender: string;
}

export interface RacesByPlace {
    liveCount: number;
    date: string;
    places: [{place: string; races: Race[]}];
}

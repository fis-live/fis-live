export interface Result {
    status: string;
    intermediate: number;
    racer: number;
    time: number;
}

export interface Status {
    id: number;
    status: string;
}

export interface StartListEntry {
    racer: number;
    order: number;
    status: string;
}

export interface Note {
    racer: number;
    note: string;
}

export interface Main {
    racedef: [string, number, number][];
    raceinfo: string[];
    message: string;
    meteo: [number, string, string, number, number, string];
    main: number;
    live: [number, number, string];
    racers: (null | [number, number, string, string, string, string, string, string, number])[];
    startlist: [number, string, number][];
    result: (null | number[])[];
    runinfo: [number, string, string];
}

export interface Update {
    live: [number, number, string];
    events: any[][];
}

export interface ServerList {
    servers: [string, number, number][];
}

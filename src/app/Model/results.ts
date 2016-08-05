import {ResultPoint} from "./result-point";

export class Results {
    public results: ResultPoint[];
    public lastBibUpdated: number[];
    public no: number;

    constructor() {
        this.results = [];
        this.lastBibUpdated = [];
    }

    public registerResult(bib: number, time: number): void {
        this.lastBibUpdated.unshift(bib);
        this.results[bib] = new ResultPoint(bib, time);
    }
}
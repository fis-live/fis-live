import { Racer } from "./racer";
import { StartListEntry } from "./start-list-entry";
import { Intermediate } from "./intermediate";
import {RaceInfo} from "./race-info";
import {Results} from "./results";
import {Run} from "./run";


export class RaceModel {
    private racerList: Racer[];
    private startList: StartListEntry[];
    private run: Run;
    public raceInfo: RaceInfo;
    public message: string;

    constructor() {
        this.racerList = [];
        this.startList = [];
    }

    initialize(data: any): void {
        this.run = new Run();
        this.run.initStartList(data.startlist);
        this.run.initIntermediates(data.racedef);

        data.result.forEach((res, index) => {
            if (res !== null) {
                res.forEach((result, key) => this.run.registerResult(key, index, result));
            }
        });
        
        console.log(this.run);
    }

    buildRacerList(racers: any) {
        for (let i = 0; i < racers.length; i++) {
            if (racers[i] !== null) {
                this.racerList.push(new Racer(racers[i][0], racers[i][1], racers[i][3], racers[i][2], racers[i][4]));
            }
        }
    }

    buildStartList(startList: any) {
        for (let i = 0; i < startList.length; i++) {
            if (startList[i] !== null) {
                this.startList.push({order: i + 1, status: startList[i][1], racer: this.getRacerByBib(startList[i][0])});
            }
        }
    }

    registerResult(result: any) {
        
    }
    
    getRacerByBib(bib: number): Racer {
        return this.racerList.find(racer => racer.bib == bib);
    }
    
    getStartList(): StartListEntry[] {
        return this.startList;
    }
    
    public getIntermediates(run: number): Intermediate[] {
        return this.run ? this.run.intermediates : [];
    }
}
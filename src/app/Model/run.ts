import {StartListEntry} from "./start-list-entry";
import {Intermediate} from "./intermediate";
import {Results} from "./results";

export class Run {
    public startList: StartListEntry[];
    public intermediates: Intermediate[];
    public results: Results[] = [];

    public initStartList(start_list: any[]): void {
        this.startList = [];
        for (let i = 0; i < start_list.length; i++) {
            if (start_list[i] !== null) {
                this.startList.push({order: i + 1, status: start_list[i][1], racer: start_list[i][0]});
            }
        }
    }

    public registerStatus(bib: number, status: string): void {
        this.startList[bib].status = status;
    }

    public initIntermediates(inter: any[]): void {
        this.intermediates = [];
        inter.forEach((def, index) => {
            this.intermediates.push({key: index, id: def[1], distance: def[2], name: def[0]});
            this.results[index] = new Results();
        });
    }

    public registerResult(index: number, bib: number, time: number): void {
        this.results[index].registerResult(bib, time);
    }
}
import { Component, OnInit } from '@angular/core';

import './rxjs-operators';

import { FisConnectionService } from "./Connection/fis-connection.service";
import { RaceModel } from "./Model/race-model";
import { Subscription } from "rxjs/Rx";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [FisConnectionService]
})
export class AppComponent implements OnInit {
    public codex: number;
    public raceModel: RaceModel;

    private observer: Subscription;
    private rows: number[] = [];

    ngOnInit() {
        this.connection.getServerList();
    }

    constructor(private connection: FisConnectionService) {
        this.raceModel = new RaceModel();
    }

    public removeTab(): void {
        this.rows.pop();
    }

    public addTab(): void {
        this.rows.push(this.rows.length);
    }


    public startServer(): void {
        if (this.observer) {
            this.stopServer();
        }
        this.connection.initialize(this.codex);

        this.observer = this.connection.poll().subscribe(
            (result) => this.process(result),
            (error) => this.handleError(error),
            () => console.log('Complete')
        );
    }

    public stopServer() {
        this.observer.unsubscribe();
        console.log('Unsubscribed');
    }

    public process(data: any) {
        console.log(data);

        // this.observer = this.fis.poll().subscribe(
        //     (result) => this.process(result),
        //     (error) => console.error(error),
        //     () => console.log('Complete')
        // );

        if (data.main) {
            this.raceModel.buildRacerList(data.racers);
            this.raceModel.initialize(data);
            this.raceModel.buildStartList(data.startlist);

            this.raceModel.raceInfo = {eventName: data.raceinfo[0], raceName: data.raceinfo[1]};
            this.raceModel.message = data.message;
        }
    }

    public handleError(error: any) {
        console.error(error);
    }
}

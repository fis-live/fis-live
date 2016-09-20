import { Component, OnInit } from '@angular/core';

import './rxjs-operators';

import { FisConnectionService } from "./Connection/fis-connection.service";
import { RaceModel } from "./Model/race-model";
import { Subscription } from "rxjs/Rx";

import { Store } from "@ngrx/store";
import { REGISTER_RESULT, ADD_RACER } from "./actions";
import { AppState } from "./reducers";
import { Racer } from "./Model/racer";

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

    constructor(private connection: FisConnectionService, private _store: Store<AppState>) {
        this.raceModel = new RaceModel();
    }

    public removeTab(): void {
        this.rows.pop();
    }

    public addTab(): void {
        this.rows.push(this.rows.length);
    }


    public startServer(): void {
        console.log(this.codex);
        if (this.observer) {
            this.stopServer();
        }
        this.connection.initialize(this.codex);

        this.observer = this.connection.poll().subscribe(
            (result) => this.process(result),
            (error) => this.handleError(error),
            () => console.log('Complete')
        );

        //this._store.dispatch({type: REGISTER_RESULT, payload: {name: 'Stina', time: 1234561}});
    }

    public stopServer() {
        this.observer.unsubscribe();
        this.observer = undefined;
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
            //this.raceModel.buildRacerList(data.racers);
            //this.raceModel.initialize(data);
            //this.raceModel.buildStartList(data.startlist);

            //this.raceModel.raceInfo = {eventName: data.raceinfo[0], raceName: data.raceinfo[1]};
            //this.raceModel.message = data.message;

            for ( let i = 0; i < data.racers.length; i++ ) {
                if (data.racers[i] !== null) {
                    this._store.dispatch({type: ADD_RACER, payload: new Racer(data.racers[i][0],
                        data.racers[i][1], data.racers[i][3], data.racers[i][2], data.racers[i][4])});
                }
            }

            for ( let i = 0; i < data.result.length; i++ ) {
                if (data.result[i]) {
                    this._store.dispatch({type: REGISTER_RESULT, payload: {name: data.racers[i][3], time: data.result[i][0]}});
                }
            }
        }
    }

    public handleError(error: any) {
        console.error(error);
    }
}

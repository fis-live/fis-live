import { Component, OnInit } from '@angular/core';

import './rxjs-operators';

import { FisConnectionService } from "./Connection/fis-connection.service";
import { RaceModel } from "./Model/race-model";
import {Subscription, Observable} from "rxjs/Rx";

import { Store } from "@ngrx/store";
import {REGISTER_RESULT, ADD_RACER, UPDATE_RACE_INFO, SET_RACE_MESSAGE, ADD_INTERMEDIATE} from "./actions";
import { AppState, getRaceInfo } from "./reducers";
import { Racer } from "./Model/racer";
import {State} from "./reducers/race-info";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [FisConnectionService]
})
export class AppComponent implements OnInit {
    public codex: number;
    public raceModel: RaceModel;
    public raceInfo$: Observable<State>;

    private observer: Subscription;
    private rows: number[] = [];

    ngOnInit() {
        this.connection.getServerList();
    }

    constructor(private connection: FisConnectionService, private _store: Store<AppState>) {
        this.raceModel = new RaceModel();
        this.raceInfo$ = _store.let(getRaceInfo);
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

            this._store.dispatch({type: UPDATE_RACE_INFO, payload: {eventName: data.raceinfo[0], raceName: data.raceinfo[1]}});
            this._store.dispatch({type: SET_RACE_MESSAGE, payload: data.message});

            for ( let i = 0; i < data.racers.length; i++ ) {
                if (data.racers[i] !== null) {
                    this._store.dispatch({type: ADD_RACER, payload: new Racer(data.racers[i][0],
                        data.racers[i][1], data.racers[i][3], data.racers[i][2], data.racers[i][4])});
                }
            }

            for ( let i = 0; i < data.result.length; i++ ) {
                if (data.result[i]) {
                    for ( let j = 0; j < data.result[i].length; j++) {
                        this._store.dispatch({
                            type: REGISTER_RESULT,
                            payload: {intermediate: j, racer: i, time: data.result[i][j]}
                        });
                    }
                }
            }

            data.racedef.forEach((def, index) => {
                this._store.dispatch({type: ADD_INTERMEDIATE, payload: {key: index, id: def[1], distance: def[2], name: def[0]}});
            });
        }
    }

    public handleError(error: any) {
        console.error(error);
    }
}

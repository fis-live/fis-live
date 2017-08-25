import {
    ChangeDetectionStrategy, Component, Input, EventEmitter, Output
} from '@angular/core';
import { style, animate, trigger, transition, state } from '@angular/animations';

import { Racer } from '../models/racer';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { nationalities } from '../fis/fis-constants';
import { AppState, getDelayState } from '../state/reducers/index';
import { Store } from '@ngrx/store';
import { SetDelay, ToggleFavorite } from '../state/actions/settings';

@Component({
    selector: 'app-sidebar',
    templateUrl: 'sidebar.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            state('hidden', style({transform: 'translateX(-100%)', display: 'none'})),
            state('visible', style({transform: 'translateX(0)'})),
            transition('hidden <=> visible', animate('200ms ease-out'))
        ])
    ],
})
export class SidebarComponent {
    @Input() public isOpen = false;
    @Input() public favoriteRacers: Racer[];
    @Output() public isOpenChange = new EventEmitter<boolean>();
    @Output() public navigate = new EventEmitter<number>();

    public tab = 'live';
    public upcomingRaces$: Observable<any>;
    public FLAGS = nationalities;
    public delay$: Observable<number>;


    constructor(private http: Http, private store: Store<AppState>) {
        this.upcomingRaces$ = this.loadRaces();
        this.delay$ = store.select(getDelayState);
    }

    public setDelay(delay: number) {
        if (isNaN(delay) || delay < 0) {
            return;
        }

        this.store.dispatch(new SetDelay(delay));
    }

    public toggleFavorite(racer: Racer) {
        this.store.dispatch(new ToggleFavorite(racer));
    }

    public loadRaces(): Observable<any> {
        return this.http.get('https://fislive-cors.herokuapp.com/liveraces.json')
            .map((response) => {
                const data = response.json();
                const ret = [];
                data.forEach((race) => {
                    if (ret.length > 5) {
                        return;
                    }

                    const i = ret.findIndex((row) => row.date === race.date);
                    if (i === -1) {
                        ret.push({
                            liveCount: race.status === 'Live' ? 1 : 0,
                            date: race.date,
                            places: [{place: race.place, races: [race]}]
                        });
                    } else {
                        const j = ret[i].places.findIndex((row) => row.place === race.place);
                        if (j === -1) {
                            ret[i].places.push({place: race.place, races: [race]});
                        } else {
                            ret[i].places[j].races.push(race);
                        }
                        ret[i].liveCount += race.status === 'Live' ? 1 : 0;
                    }
                });

                return ret;
            })
            .catch((error) => {
                console.log(error);
                const errMsg = (error instanceof Error) ? error :
                    (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

                return Observable.throw(errMsg);
            });
    }

    public open(): void {
        this.isOpen = true;
        this.isOpenChange.emit(true);
    }

    public close(): void {
        this.isOpen = false;
        this.isOpenChange.emit(false);
    }

    public go(codex: number): void {
        this.close();
        this.navigate.emit(codex);
    }
}

import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { nationalities } from '../fis/fis-constants';
import { RacesByPlace } from '../models/race';
import { Event, Racer } from '../models/racer';
import { SetDelay, ToggleFavorite } from '../state/actions/settings';
import { AppState, getDelayState, selectEvents, selectRacesByPlace } from '../state/reducers';

@Component({
    selector: 'app-sidebar',
    templateUrl: 'sidebar.component.html',
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
    public upcomingRaces$: Observable<RacesByPlace[]>;
    public FLAGS = nationalities;
    public delay$: Observable<number>;
    public events$: Observable<Event[]>;

    constructor(private store: Store<AppState>) {
        this.upcomingRaces$ = store.select(selectRacesByPlace);
        this.delay$ = store.select(getDelayState);
        this.events$ = store.pipe(
            select(selectEvents)
        );
    }

    public setDelay(delay: number) {
        if (isNaN(delay) || delay < 0) {
            return;
        }

        this.store.dispatch(new SetDelay(delay));
    }

    public sync(timestamp: number) {
        this.store.dispatch(new SetDelay(Date.now() - timestamp));
    }

    public toggleFavorite(racer: Racer) {
        this.store.dispatch(new ToggleFavorite(racer));
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

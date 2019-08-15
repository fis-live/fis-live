import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Intermediate } from '../models/intermediate';
import { RacesByPlace } from '../models/race';
import { Event, Racer } from '../models/racer';
import { setDelay, toggleFavorite } from '../state/actions/settings';
import { AppState, getDelayState, selectAllIntermediates, selectEvents, selectRacesByPlace } from '../state/reducers';

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
    public delay$: Observable<number>;
    public events$: Observable<Event[]>;
    public intermediates$: Observable<Intermediate[]>;
    private selectedInter = new BehaviorSubject<number>(0);

    constructor(private store: Store<AppState>) {
        this.upcomingRaces$ = store.select(selectRacesByPlace);
        this.delay$ = store.select(getDelayState);
        this.events$ = combineLatest(this.selectedInter, store.select(selectEvents)).pipe(
            map(([inter, events]) => events.filter(event => event.interId === inter))
        );
        this.intermediates$ = store.pipe(select(selectAllIntermediates));
    }

    public setDelay(delay: number) {
        if (isNaN(delay) || delay < 0) {
            return;
        }

        this.store.dispatch(setDelay({delay}));
    }

    public sync(timestamp: number) {
        this.store.dispatch(setDelay({delay: Date.now() - timestamp}));
    }

    public toggleFavorite(racer: Racer) {
        this.store.dispatch(toggleFavorite({racer}));
    }

    public open(): void {
        this.isOpen = true;
        this.isOpenChange.emit(true);
    }

    public close(): void {
        this.isOpen = false;
        this.isOpenChange.emit(false);
    }

    public next(id: string) {
        this.selectedInter.next(parseInt(id, 10));
    }


    public go(codex: number): void {
        this.close();
        this.navigate.emit(codex);
    }
}

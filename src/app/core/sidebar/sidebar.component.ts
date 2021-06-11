import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Column } from '../../datagrid/state/model';
import { Intermediate } from '../../models/intermediate';
import { RacesByPlace } from '../../models/race';
import { Event, Racer } from '../../models/racer';
import { reorderColumn, setDelay, toggleColumn, toggleFavorite, toggleTicker } from '../../state/actions/settings';
import {
    AppState,
    getDelayState,
    getResultState,
    selectAllIntermediates, selectAllRacers,
    selectFavoriteRacers,
    selectRacesByPlace
} from '../../state/reducers';

@Component({
    selector: 'app-sidebar',
    templateUrl: 'sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            transition(':enter', [
                style({transform: 'translateX(-100%)'}),
                animate('200ms ease-out', style({transform: 'translateX(0)'}))
            ]),
            transition(':leave', [
                animate('200ms ease-out', style({transform: 'translateX(-100%)'}))
            ])
        ])
    ],
})
export class SidebarComponent {
    @Input() public isOpen = false;
    @Output() public isOpenChange = new EventEmitter<boolean>();
    @Output() public navigate = new EventEmitter<number>();

    public tab = 'live';
    public upcomingRaces$: Observable<RacesByPlace[]>;
    public delay$: Observable<number>;
    public events$: Observable<Event[]>;
    public intermediates$: Observable<Intermediate[]>;
    public selectedInter = new BehaviorSubject<number>(0);
    public columns$: Observable<Column[]>;
    public tickerEnabled$: Observable<boolean>;
    public favoriteRacers$: Observable<Racer[]>;
    public racers$: Observable<Racer[]>;

    constructor(private store: Store<AppState>) {
        this.upcomingRaces$ = store.select(selectRacesByPlace);
        this.favoriteRacers$ = store.select(selectFavoriteRacers);
        this.racers$ = store.select(selectAllRacers);
        this.delay$ = store.select(getDelayState);
        this.tickerEnabled$ = store.select(state => state.settings.tickerEnabled);
        this.events$ = combineLatest([this.selectedInter, store.select(getResultState)]).pipe(
            map(([inter, _state]) => _state.standings[inter]?.events.slice().reverse() ?? [])
        );
        this.intermediates$ = store.select(selectAllIntermediates);

        this.columns$ = this.store.select((state) => {
            return state.settings.defaultColumns;
        });
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

    public toggleTicker() {
        this.store.dispatch(toggleTicker());
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

    public go(codex: string): void {
        this.close();
        this.navigate.emit(+codex);
    }

    public toggleColumn(column: string) {
        this.store.dispatch(toggleColumn({ column }));
    }

    public onDrop(event: CdkDragDrop<string[]>) {
        this.store.dispatch(reorderColumn({
            previousIndex: event.previousIndex,
            currentIndex: event.currentIndex,
        }));
    }

    public trackBy(index: number, column: Column) {
        return column.id;
    }
}

import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Column } from '../../datagrid/state/model';
import { Event, Intermediate, Racer } from '../../fis/cross-country/models';
import { RacesByPlace } from '../../fis/shared';
import {
    reorderColumn,
    setDelay,
    setNameFormat,
    toggleColumn,
    toggleFavorite,
    toggleIndividualDetailsTab,
    toggleTicker
} from '../../state/actions/settings';
import {
    AppState,
    getDelayState,
    getResultState,
    selectAllIntermediates, selectAllRacers,
    selectFavoriteRacers,
    selectRacesByPlace
} from '../../state/reducers';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: 'sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            transition(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('200ms ease-out', style({ transform: 'translateX(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-out', style({ transform: 'translateX(-100%)' }))
            ])
        ])
    ],
    imports: [
        IconComponent,
        PushPipe,
        RouterLink,
        RouterLinkActive,
        CdkDropList,
        CdkDragHandle,
        FormsModule,
        LetDirective,
        CdkDrag
    ]
})
export class SidebarComponent {
    public readonly isOpen = model(false);
    public readonly navigate = output<number>();

    public upcomingRaces$: Observable<RacesByPlace[]>;
    public delay$: Observable<number>;
    public events$: Observable<Event[]>;
    public intermediates$: Observable<Intermediate[]>;
    public selectedInter = new BehaviorSubject<number>(0);
    public columns$: Observable<Column[]>;
    public tickerEnabled$: Observable<boolean>;
    public favoriteRacers$: Observable<Racer[]>;
    public racers$: Observable<Racer[]>;
    public nameFormat$: Observable<string>;
    public indDetailsEnabled$: Observable<boolean>;

    protected readonly tab = signal<'live' | 'sync' | 'settings'>('live');

    constructor(private store: Store<AppState>) {
        this.upcomingRaces$ = store.select(selectRacesByPlace);
        this.favoriteRacers$ = store.select(selectFavoriteRacers);
        this.racers$ = store.select(selectAllRacers);
        this.delay$ = store.select(getDelayState);
        this.tickerEnabled$ = store.select(state => state.settings.tickerEnabled);
        this.indDetailsEnabled$ = store.select(state => state.settings.indDetailsTab);
        this.events$ = combineLatest([this.selectedInter, store.select(getResultState)]).pipe(
            map(([inter, _state]) => _state.standings[inter]?.events.slice().reverse() ?? [])
        );
        this.intermediates$ = store.select(selectAllIntermediates);

        this.columns$ = this.store.select((state) => {
            return state.settings.defaultColumns;
        });
        this.nameFormat$ = this.store.select((state) => {
            return state.settings.nameFormat;
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

    public toggleIndividualDetails() {
        this.store.dispatch(toggleIndividualDetailsTab());
    }

    public open(): void {
        this.isOpen.set(true);
    }

    public close(): void {
        this.isOpen.set(false);
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


    public setNameFormat(format: string) {
        this.store.dispatch(setNameFormat({ format }));
    }

    public onDrop(event: CdkDragDrop<string[]>) {
        this.store.dispatch(reorderColumn({
            previousIndex: event.previousIndex,
            currentIndex: event.currentIndex,
        }));
    }
}

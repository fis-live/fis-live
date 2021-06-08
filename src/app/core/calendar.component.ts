import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RacesByDate } from '../models/race';
import { AppState, selectRacesByDate } from '../state/reducers';

@Component({
    selector: 'app-calendar',
    template: `
        <div class="container">
    <table class="datagrid">
        <tr>
            <th><div>Codex</div></th>
            <th><div>Place</div></th>
            <th><div>Nation</div></th>
            <th><div>Category</div></th>
            <th><div>CET Time</div></th>
            <th><div>Status</div></th>

        </tr>
        <ng-container *ngFor="let racesByDate of upcomingRaces$ | ngrxPush">
            <tr class="date"><td colspan="6"><div> {{ racesByDate.date }}</div></td></tr>

            <tr *ngFor="let race of racesByDate.races" (click)="go(race.codex)">
                <td><div>{{ race.codex }}</div></td>
                <td><div>{{ race.place }}</div></td>
                <td><div>{{ race.nation }}</div></td>
                <td><div>{{ race.category }}</div></td>
                <td><div>{{ race.time }}</div></td>
                <td><div><span class="badge">{{ race.status }}</span></div></td>
            </tr>
        </ng-container>
    </table></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
    public upcomingRaces$: Observable<RacesByDate[]>;

    constructor(store: Store<AppState>, private router: Router) {
        this.upcomingRaces$ = store.select(selectRacesByDate);
    }

    public go(codex: number): void {
        this.router.navigate(['', codex]);
    }
}

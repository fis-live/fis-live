import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PushPipe } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RacesByDate } from '../fis/shared';
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
                @for (racesByDate of upcomingRaces$ | ngrxPush; track racesByDate.date) {
                    <tr class="date"><td colspan="6"><div> {{ racesByDate.date }}</div></td></tr>

                    @for (race of racesByDate.races; track race.codex) {
                        <tr (click)="go(race.codex)">
                            <td><div>{{ race.codex }}</div></td>
                            <td><div>{{ race.place }}</div></td>
                            <td><div>{{ race.nation }}</div></td>
                            <td><div>{{ race.category }}</div></td>
                            <td><div>{{ race.time }}</div></td>
                            <td><div><span class="badge">{{ race.status }}</span></div></td>
                        </tr>
                    }
                }
            </table>
        </div>
    `,
    imports: [
        PushPipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
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

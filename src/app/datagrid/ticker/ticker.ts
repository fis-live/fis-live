import { animate, group, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Event } from '../../models/racer';
import { AppState, getResultState } from '../../state/reducers';
import { DatagridConfig } from '../providers/config';

@Component({
    selector: 'app-dg-ticker',
    templateUrl: './ticker.html',
    animations: [
        trigger('animation', [
            transition(':enter', group([
                style({transform: 'translateY(-24px)'}),
                style({ backgroundColor: '#F7D57F' }),
                animate('400ms ease', style({
                    transform: 'translateY(0)'
                })),
                animate('400ms 1500ms ease', style({ backgroundColor: '*' }))
            ])),
            transition(':increment, :leave', group([
                style({transform: 'translateY(-24px)'}),
                animate('400ms ease', style({
                    transform: 'translateY(0)'
                }))
            ]))
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridTickerComponent {
    public readonly events$: Observable<Event[]>;

    constructor(private _config: DatagridConfig, private _store: Store<AppState>) {
        this.events$ = this._config.getConfig().pipe(
            select((state) => state.view.inter),
            switchMap((intermediate) =>
                this._store.select(getResultState).pipe(
                    map((state) => {
                        const inter = intermediate == null ? null : intermediate.key;
                        const rows: Event[] = [];
                        if (inter === null) {
                            return [];
                        }

                        for (const event of state.standings[inter].events) {
                            rows.push(event);
                        }

                        return rows;
                    })
                )
            )
        );
    }
}

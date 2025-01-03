import { animate, group, style, transition, trigger } from '@angular/animations';
import { LowerCasePipe, NgClass, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Event } from '../../fis/cross-country/models';
import { AppState, getResultState } from '../../state/reducers';
import { DatagridStore } from '../state/datagrid-store';

@Component({
    selector: 'app-dg-ticker',
    templateUrl: './datagrid-ticker.html',
    animations: [
        trigger('animation', [
            transition(':enter', group([
                style({ transform: 'translateY(-24px)' }),
                style({ backgroundColor: '#F7D57F' }),
                animate('400ms ease', style({
                    transform: 'translateY(0)'
                })),
                animate('400ms 1500ms ease', style({ backgroundColor: '*' }))
            ])),
            transition(':increment, :leave', group([
                style({ transform: 'translateY(-24px)' }),
                animate('400ms ease', style({
                    transform: 'translateY(0)'
                }))
            ]))
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgForOf,
        PushPipe,
        LowerCasePipe,
        NgClass
    ]
})
export class DatagridTicker {
    public readonly events$: Observable<Event[]>;

    constructor(private _config: DatagridStore, private _store: Store<AppState>) {
        this.events$ = _config.select(
            _config.view$,
            _store.select(getResultState),
            (view, state) => view.inter ? state.standings[view.inter.key].events : []
        );
    }
}

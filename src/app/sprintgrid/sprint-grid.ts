import { animate, keyframes, query, style, transition, trigger } from '@angular/animations';
import { CdkTableModule } from '@angular/cdk/table';
import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PushPipe } from '@ngrx/component';
import { Store } from '@ngrx/store';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IconComponent } from '../core/icon/icon.component';

import { Sort } from '../datagrid/sort/sort';
import { Prop, ResultItem } from '../datagrid/state/model';
import { Heat } from '../fis/cross-country/models';
import { maxVal, timePenalty } from '../fis/fis-constants';
import { AppState } from '../state/reducers';
import { formatTime } from '../utils/utils';

@Component({
    selector: 'app-sprint-grid',
    templateUrl: './sprint-grid.html',
    animations: [
        trigger('update', [
            transition(':increment', [
                query('td > div', [
                    animate('1000ms ease', keyframes([
                        style({ backgroundColor: '#9BD8F3' }),
                        style({ backgroundColor: '*' })
                    ]))
                ])
            ])
        ])
    ],
    providers: [Sort],
    imports: [
        CdkTableModule,
        IconComponent,
        PushPipe,
        NgIf,
        NgClass
    ]
})
export class SprintGrid {
    public rows$: Observable<ResultItem[]> = EMPTY;
    public heat$: Observable<Heat> = EMPTY;

    @Input()
    public set runAndHeat(runAndHeat: [number, number]) {
        const run = runAndHeat[0];
        const heat = runAndHeat[1];
        this.rows$ = this._store.select((appState) => {
            const state = appState.result;
            const _heat = state.runs[run]?.heats[heat];
            if (!_heat) { return [] as ResultItem[]; }

            const precision = state.precision;

            const rows: ResultItem[] = [];
            for (const id of _heat.ids) {
                const entity = state.entities[id];
                const mark = entity.marks[run];
                const classes = [entity.racer.nsa.toLowerCase()];

                if (entity.racer.isFavorite) {
                    classes.push('favorite');
                }

                if (entity.racer.color) {
                    classes.push(entity.racer.color);
                }

                if (!mark) {
                    rows.push({
                        state: 'normal',
                        racer: entity.racer,
                        time: {
                            value: maxVal,
                            display: entity.status,
                            leader: false
                        },
                        tourStanding: {
                            value: maxVal,
                            display: '',
                            leader: false
                        },
                        rank: entity.order,
                        diff: {
                            value: maxVal,
                            display: '',
                            leader: false
                        },
                        notes: entity.notes,
                        classes: classes,
                        marks: [],
                        version: 0
                    });
                } else {
                    const time = mark.time;

                    let timeProp: Prop<number> | Prop<string>;
                    let tourStandingProp: Prop<number>;
                    timeProp = {
                        display: formatTime(time + timePenalty[mark.status], _heat.leader, precision, false) || mark.status,
                        value: time + timePenalty[mark.status],
                        leader: mark.rank === 1
                    };

                    tourStandingProp = {
                        value: maxVal,
                        display: '',
                        leader: false
                    };

                    const diffProp = {
                        display: '',
                        value: maxVal,
                        leader: false
                    };

                    if (mark.rank == null) {
                        classes.push('disabled');
                    }

                    rows.push({
                        state: 'normal',
                        racer: entity.racer,
                        time: timeProp,
                        tourStanding: tourStandingProp,
                        rank: mark.rank,
                        diff: diffProp,
                        notes: entity.notes,
                        classes: classes,
                        marks: [],
                        version: 0
                    });
                }
            }

            return rows;
        }).pipe(
            map((rows) => rows.sort((a, b) => this.sort.compare(a, b)))
        );

        this.heat$ = this._store.select((state) => {
            return state.result.runs[run]?.heats[heat] || null;
        });
    }

    constructor(private readonly _store: Store<AppState>, private readonly sort: Sort) {
        sort.comparator = 'rank';
    }

    public track(index: number, item: ResultItem): number {
        return item.racer.bib;
    }
}

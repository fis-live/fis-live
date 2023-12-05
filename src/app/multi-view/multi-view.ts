import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Sort } from '../datagrid/sort/sort';
import { Prop } from '../datagrid/state/model';
import { Racer } from '../fis/cross-country/models';
import { timePenalty } from '../fis/fis-constants';
import { formatTime } from '../utils/utils';

import { Comparator } from './compare-races';

@Component({
    selector: 'app-multi-view',
    templateUrl: './multi-view.html',
    providers: [Sort]
})
export class MultiView implements OnInit {
    public rows$: Observable<{
        id: number;
        racer: Racer;
        marks: Prop<string | number>[];
    }[]>;

    public dynamicColumns = [
        {
            id: '0',
            sortBy: 'marks.0',
            key: '0',
            name: 'Falun'
        },
        {
            id: '1',
            sortBy: 'marks.1',
            key: '1',
            name: 'NM'
        }
    ];

    ngOnInit() {
    }

    constructor(private router: Router, private route: ActivatedRoute, private _compare: Comparator) {
        this.rows$ = _compare.load([ 4032, 3018 ]).pipe(
            map((races) => {
                const rows = [];
                for (const id of races.ids) {
                    const marks: Prop<number | string>[] = [];
                    let count = 0;
                    for (const [i, race] of races.races.entries()) {
                        const mark = race.marks[id];
                        if (mark !== undefined && mark.rank !== null) {
                            count++;
                            marks[i] = {
                                display: formatTime(mark.time + timePenalty[mark.status], race.leader, -2, true) || mark.status,
                                value: mark.time + timePenalty[mark.status],
                                leader: mark.rank === 1
                            };
                        }
                    }
                    if (count > 1) {
                        rows.push({
                            id: id,
                            racer: races.entities[id],
                            marks
                        });
                    }
                }

                return rows;
            }),
            tap(comp => {
                const sum: number[] = [0, 0];
                for (const racer of comp) {
                    for (const [index, mark] of racer.marks.entries()) {
                        sum[index] += +(mark.display.toString().slice(1, -1));
                    }
                }
                console.log('Beito: ', sum[0] / (comp.length));
                console.log('Falun: ', sum[1] / (comp.length));
            })
        );
    }
}

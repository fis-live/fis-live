import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Option, OptionSelector } from '../../core/select/option-selector';
import { APP_OPTIONS } from '../../core/select/select';
import { Mark, Racer } from '../../fis/cross-country/models';
import { isBonus, maxVal } from '../../fis/fis-constants';
import { toggleIndividualDetailsTab } from '../../state/actions/settings';
import { AppState, getResultState, selectAllRacers } from '../../state/reducers';
import { formatTime } from '../../utils/utils';


interface State {
    racer: Racer | null;
    tab: 'progress' | 'sectors';
}

@Component({
    selector: 'app-details',
    templateUrl: 'details.html',
    providers: [{provide: APP_OPTIONS, useExisting: Details}],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Details extends ComponentStore<State> implements OptionSelector<State, Racer> {
    public readonly rows$: Observable<any[]>;
    public tab = 'progress';

    constructor(public store: Store<AppState>) {
        super({ racer: null, tab: 'progress' });

        this.rows$ = this.select(this.store.select(getResultState), this.state$, (state, localState) => {
                const rows: any[] = [];
                let winner: Mark[] | null = null;
                if (state.standings[state.interById[99]] != null) {
                    const ids = state.standings[state.interById[99]].ids;
                    for (const id of ids) {
                        if (state.entities[id].marks[state.interById[99]].rank === 1) {
                            winner = state.entities[id].marks;
                        }
                    }
                }

                for (const inter of state.intermediates) {
                    if (inter.type === 'start_list') { continue; }
                    if (!isBonus(inter) && localState.racer) {
                        const standings = state.standings[inter.key];
                        const mark = state.entities[localState.racer.bib].marks[inter.key];
                        if (mark != null && mark.rank != null) {
                            let time: number, leader: number, winnerTime: number;
                            if (localState.tab === 'progress') {
                                time = mark.time;
                                leader = standings.leader;
                                winnerTime = winner ? winner[inter.key].time : leader;
                            } else {
                                time = mark.diffs[mark.diffs.length - 1];
                                leader = standings.bestDiff[standings.bestDiff.length - 1];
                                winnerTime = winner ? winner[inter.key].diffs[winner[inter.key].diffs.length - 1] : leader;
                            }

                            rows.push({
                                inter: inter.short,
                                time: formatTime(time, null, state.precision),
                                behind: formatTime(time, leader, state.precision),
                                rank: mark.rank,
                                behindWinner: formatTime(time, winnerTime, state.precision)
                            });
                        } else if (mark == null) {
                            if (localState.tab === 'progress' && inter.key === state.entities[localState.racer.bib].marks.length) {
                                const lastMark = state.entities[localState.racer.bib].marks[inter.key - 1];
                                if (lastMark.timestamp) {
                                    const zero = standings.leader < maxVal ? standings.leader : 0;
                                    rows.push({
                                        inter: inter.short,
                                        time: lastMark.time - lastMark.timestamp - zero,
                                        behind: '',
                                        rank: '',
                                        behindWinner: ''
                                    });
                                } else {
                                    rows.push({
                                        inter: inter.short,
                                        time: '',
                                        behind: '',
                                        rank: '',
                                        behindWinner: ''
                                    });
                                }
                            } else {
                                rows.push({
                                    inter: inter.short,
                                    time: '',
                                    behind: '',
                                    rank: '',
                                    behindWinner: ''
                                });
                            }
                        } else {
                            rows.push({
                                inter: inter.short,
                                time: mark.status,
                                behind: '',
                                rank: '',
                                behindWinner: ''
                            });
                        }
                    } else if (!isBonus(inter)) {
                        rows.push({
                            inter: inter.short,
                            time: '',
                            behind: '',
                            rank: '',
                            behindWinner: ''
                        });
                    }
                }

                return rows;
            });
    }

    public readonly setTab = this.updater((state, tab: 'progress' | 'sectors') => {
        this.tab = tab;
        return { ...state, tab };
    });

    getRenderSelectionChanged() {
        return this.state$;
    }

    updateSelection(value: Racer, key: 'racer'): void {
        this.setState((state) => {
            return {
                ...state,
                racer: value
            };
        });
    }

    getOptions(): Observable<{ racer: Option<Racer>[]; }> {
        return this.store.select(selectAllRacers).pipe(
            map(racers => {
                return { racer: racers.map((racer) => ({ value: racer, selected: false, disabled: false })) };
            })
        );
    }

    close() {
        this.store.dispatch(toggleIndividualDetailsTab());
    }

    public track(index: number, item: any): number {
        return item.inter;
    }
}

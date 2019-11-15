import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Racer } from '../../../models/racer';
import { AppState, selectAllRacers } from '../../../state/reducers';
import { Config, DatagridConfig } from '../providers/config';

@Component({
    selector: 'app-dg-header',
    templateUrl: './datagrid-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatagridHeader {
    @Input() public dgId: string = "";

    public readonly racers$: Observable<Racer[]>;
    public readonly config$: Observable<Config> = this._config.getConfig();

    constructor(private _config: DatagridConfig, store: Store<AppState>) {
        this.racers$ = store.pipe(select(selectAllRacers));
    }

    public toggleMode(checked: boolean) {
        this._config.setMode(checked ? 'analysis' : 'normal');
    }

    public setDisplayMode(display: 'total' | 'diff') {
        this._config.setDisplayMode(display);
    }

    public setZero(bib: string) {
        this._config.setZero(parseInt(bib, 10));
    }
}

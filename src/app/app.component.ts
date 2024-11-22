import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PushPipe } from '@ngrx/component';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AlertComponent } from './core/alert/alert.component';
import { closeAlert } from './state/actions/connection';
import { AppState, getAlertState } from './state/reducers/';
import { State as AlertState } from './state/reducers/alert';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet, AlertComponent, PushPipe]
})
export class AppComponent {
    public alert$: Observable<AlertState>;

    constructor(private _store: Store<AppState>) {
        this.alert$ = _store.select(getAlertState);
    }

    public closeAlert(): void {
        this._store.dispatch(closeAlert());
    }

    public alertAction(actions: Action[]): void {
        actions.forEach((action) => this._store.dispatch(action));
        this.closeAlert();
    }
}

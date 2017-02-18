import { Component } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState, getAlertState } from './state/reducers/';
import { State as AlertState } from './state/reducers/alert';
import { CloseAlertAction } from './state/actions/connection';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    public alert$: Observable<AlertState>;

    constructor(private _store: Store<AppState>) {
        this.alert$ = _store.select(getAlertState);
    }

    public closeAlert(): void {
        this._store.dispatch(new CloseAlertAction());
    }

    public alertAction(actions: Action[]): void {
        actions.forEach((action) => this._store.dispatch(action));
        this.closeAlert();
    }
}

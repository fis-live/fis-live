import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import './rxjs-operators';

import { Observable } from "rxjs/Rx";

import { AppState, getErrorState } from "./reducers";
import { State as ErrorState } from './reducers/error';
import { LoadServerAction } from "./actions/connection";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    public error$: Observable<ErrorState>;

    ngOnInit() {
        this._store.dispatch(new LoadServerAction());
    }

    constructor(private _store: Store<AppState>) {
        this.error$ = _store.let(getErrorState).do((state: ErrorState) => {
            if (state.error) {
                let el: any = jQuery('.ui.modal');
                el.modal('show');
            }
        });
    }
}

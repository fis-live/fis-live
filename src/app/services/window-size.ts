import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

const getWindowSize = () => {
    return {
        height: window.innerHeight,
        width: window.innerWidth
    };
};

const createWindowSize$ = () =>
    Observable.fromEvent(window, 'resize')
        .map(getWindowSize)
        .startWith(getWindowSize())
        .publishReplay(1)
        .refCount();

@Injectable()
export class WindowSize {
    width$: Observable<number>;
    height$: Observable<number>;

    constructor() {
        const windowSize$ = createWindowSize$();
        this.width$ = (windowSize$.pluck('width') as Observable<number>).distinctUntilChanged();
        this.height$ = (windowSize$.pluck('height') as Observable<number>).distinctUntilChanged();
    }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { distinctUntilChanged, map, pluck, publishReplay, refCount, startWith } from 'rxjs/operators';

const getWindowSize = () => {
    return {
        height: window.innerHeight,
        width: window.innerWidth
    };
};

const createWindowSize$ = () =>
    fromEvent(window, 'resize').pipe(
        map(getWindowSize),
        startWith(getWindowSize()),
        publishReplay(1),
        refCount()
    );

@Injectable()
export class WindowSize {
    width$: Observable<number>;
    height$: Observable<number>;

    constructor() {
        const windowSize$ = createWindowSize$();
        this.width$ = (windowSize$.pipe(
            pluck('width'),
            distinctUntilChanged()
        ) as Observable<number>);
        this.height$ = (windowSize$.pipe(
            pluck('height'),
            distinctUntilChanged()
        ) as Observable<number>);
    }
}

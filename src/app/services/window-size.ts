import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, startWith } from 'rxjs/operators';

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
        this.width$ = windowSize$.pipe(
            map(window => window.width),
            distinctUntilChanged()
        );
        this.height$ = windowSize$.pipe(
            map(window => window.height),
            distinctUntilChanged()
        );
    }
}

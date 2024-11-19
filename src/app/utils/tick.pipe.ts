import { ChangeDetectorRef, ErrorHandler, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatestWith, EMPTY, NextObserver, Subject, timer, Unsubscribable } from 'rxjs';
import { catchError, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';

import { AppState, getDelayState } from '../state/reducers';

import { formatTime } from './utils';

@Pipe({
    name: 'appTick',
    pure: false,
    standalone: true
})
export class TickPipe implements PipeTransform, OnDestroy {
    private renderedValue: string = '';

    private readonly subscription: Unsubscribable;
    private readonly updateViewContextObserver: NextObserver<string> = {
        next: (value) => (this.renderedValue = value),
    };
    private readonly potentialObservablesSubject: Subject<number | string> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private errorHandler: ErrorHandler,
        private store: Store<AppState>
    ) {
        const rendering$ = this.potentialObservablesSubject.pipe(
            distinctUntilChanged(),
            combineLatestWith(store.select(getDelayState)),
            switchMap(([timeOrString, delay]) => {
                if (typeof timeOrString === 'string') {
                    this.updateViewContextObserver.next(timeOrString);
                    this.cdRef.markForCheck();

                    return EMPTY;
                }

                const time = timeOrString + Date.now() - delay;
                const due = time < 0 ? -(time % 1000) : 1000 - time % 1000;
                const observable$ = timer(due, 1000).pipe(
                    map(i => formatTime(time + due + i * 1000, null, 0)),
                    startWith(formatTime(time, null, 0)),
                );

                return observable$.pipe(
                    tap((value) => {
                        this.updateViewContextObserver.next(value);
                        this.cdRef.markForCheck();
                    }),
                    catchError((e) => {
                        this.errorHandler.handleError(e);
                        return EMPTY;
                    })
                );
            })
        );

        this.subscription = rendering$.subscribe();
    }

    transform(numberOrString: number | string) {
        this.potentialObservablesSubject.next(numberOrString);
        return this.renderedValue;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}

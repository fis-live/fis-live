import { Operator } from 'rxjs/Operator';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';
import { TimeInterval } from 'rxjs/Rx';

/**
 * @param due
 * @param errorToSend
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export function timeoutInterval<T>(due: number,
                                   errorToSend: any = null,
                                   scheduler: Scheduler = async): Observable<TimeInterval<T>> {
    const absoluteTimeout = false;
    const waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
    return this.lift(new TimeoutIntervalOperator(waitFor, absoluteTimeout, errorToSend, scheduler));
}

export class ErrorTimeInterval {
    constructor(public error: any, public interval: number) {

    }
}

export interface TimeoutIntervalSignature<T> {
    (due: number, scheduler?: Scheduler): Observable<TimeInterval<T>>;
}

class TimeoutIntervalOperator<T> implements Operator<T, TimeInterval<T>> {
    constructor(private waitFor: number,
                private absoluteTimeout: boolean,
                private errorToSend: any,
                private scheduler: Scheduler) {
    }

    call(observer: Subscriber<TimeInterval<T>>, source: any): any {
        return source._subscribe(new TimeoutIntervalSubscriber<T>(
            observer, this.absoluteTimeout, this.waitFor, this.errorToSend, this.scheduler
        ));
    }
}


/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeoutIntervalSubscriber<T> extends Subscriber<T> {

    private lastTime: number = 0;
    private index: number = 0;
    private _previousIndex: number = 0;
    private _hasCompleted: boolean = false;

    get previousIndex(): number {
        return this._previousIndex;
    }

    get hasCompleted(): boolean {
        return this._hasCompleted;
    }

    private static dispatchTimeout(state: any): void {
        const source = state.subscriber;
        const currentIndex = state.index;
        if (!source.hasCompleted && source.previousIndex === currentIndex) {
            source.notifyTimeout();
        }
    }

    constructor(destination: Subscriber<TimeInterval<T>>,
                private absoluteTimeout: boolean,
                private waitFor: number,
                private errorToSend: any,
                private scheduler: Scheduler) {
        super(destination);
        this.scheduleTimeout();
        this.lastTime = scheduler.now();
    }

    private scheduleTimeout(): void {
        const currentIndex = this.index;
        this.scheduler.schedule(TimeoutIntervalSubscriber.dispatchTimeout, this.waitFor, { subscriber: this, index: currentIndex });
        this.index++;
        this._previousIndex = currentIndex;
    }

    protected _next(value: T) {
        const now = this.scheduler.now();
        const span = now - this.lastTime;
        this.lastTime = now;

        this.destination.next(new TimeInterval(value, span));

        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
    }

    protected _error(err: any) {
        const now = this.scheduler.now();
        const span = now - this.lastTime;
        this.lastTime = now;

        this.destination.error(new ErrorTimeInterval(err, span));
        this._hasCompleted = true;
    }

    protected _complete() {
        this.destination.complete();
        this._hasCompleted = true;
    }

    notifyTimeout() {
        this.error(this.errorToSend || new Error('timeout'));
    }
}

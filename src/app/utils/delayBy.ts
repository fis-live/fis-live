import {
    asyncScheduler,
    MonoTypeOperatorFunction,
    Notification,
    Observable, ObservableInput,
    Operator,
    PartialObserver, SchedulerAction, SchedulerLike,
    Subscriber, Subscription,
    TeardownLogic
} from 'rxjs';
import { InnerSubscriber, OuterSubscriber, subscribeToResult } from 'rxjs/internal-compatibility';

export enum DelayBehavior {
    Delay,
    NoDelay,
    Clear
}

export function delayBy<T>(delay: ObservableInput<number>,
                           shouldDelay: (value: T) => DelayBehavior = () => DelayBehavior.Delay,
                           scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => source.lift(new DelayByOperator(delay, shouldDelay, scheduler));
}

class DelayByOperator<T> implements Operator<T, T> {
    constructor(private delay: ObservableInput<number>,
                private shouldDelay: (value: T) => DelayBehavior, private scheduler: SchedulerLike) {}

    call(subscriber: Subscriber<T>, source: any): TeardownLogic {
        return source.subscribe(new DelayBySubscriber(subscriber, this.delay, this.shouldDelay, this.scheduler));
    }
}

interface DelayByState<T> {
    source: DelayBySubscriber<T>;
    destination: PartialObserver<T>;
    scheduler: SchedulerLike;
}

class DelayByMessage<T> {
    constructor(public readonly time: number,
                public readonly notification: Notification<T>) {
    }
}

class DelayBySubscriber<T> extends OuterSubscriber<T, number> {
    private queue: Array<DelayByMessage<T>> = [];
    private active: boolean = false;
    private errored: boolean = false;

    private scheduledSub: Subscription | null = null;
    private delayValue: number = 0;

    private static dispatch<T>(this: SchedulerAction<DelayByState<T>>, state?: DelayByState<T>): void {
        if (state === undefined) {
            return;
        }

        const { source, scheduler, destination } = state;
        const _queue = source.queue;
        const delayValue = source.delayValue;

        while (_queue.length > 0 && (_queue[0].time + delayValue - scheduler.now()) <= 0) {
            _queue.shift()!.notification.observe(destination);
        }

        if (_queue.length > 0) {
            const delay = Math.max(0, _queue[0].time + delayValue - scheduler.now());
            this.schedule(state, delay);
        } else {
            this.unsubscribe();
            source.active = false;
            source.scheduledSub = null;
        }
    }

    constructor(destination: Subscriber<T>,
                private delay: ObservableInput<number>,
                private shouldDelay: (value: T) => DelayBehavior,
                private scheduler: SchedulerLike) {
        super(destination);
        this._innerSub(delay);
    }

    private _innerSub(result: ObservableInput<number>) {
        const innerSubscriber = new InnerSubscriber(this, undefined, 0);
        const destination = this.destination as Subscription;
        destination.add(innerSubscriber);
        subscribeToResult(this, result, undefined, undefined, innerSubscriber);
    }

    private _schedule(scheduler: SchedulerLike): void {
        this.active = true;
        const delay = (this.queue[0]) ? Math.max(0, this.queue[0].time + this.delayValue - scheduler.now()) : 0;
        const destination = this.destination as Subscription;
        destination.add(this.scheduledSub = scheduler.schedule<DelayByState<T>>(DelayBySubscriber.dispatch, delay, {
            source: this, destination: this.destination, scheduler: scheduler
        }));
    }

    private scheduleNotification(notification: Notification<T>, behavior: DelayBehavior): void {
        if (this.errored) {
            return;
        }

        const scheduler = this.scheduler;
        const time = behavior === DelayBehavior.Delay ? scheduler.now() : 0;
        const message = new DelayByMessage(time, notification);
        this.queue.push(message);

        if (!this.active) {
            this._schedule(scheduler);
        }
    }

    protected _next(value: T) {
        const behavior = this.shouldDelay(value);
        if (behavior !== DelayBehavior.Clear) {
            this.scheduleNotification(Notification.createNext(value), behavior);
        } else {
            this.queue = [];
            if (this.active && this.scheduledSub) {
                this.scheduledSub.unsubscribe();
                this.scheduledSub = null;
                this.active = false;
            }
            this.destination.next!(value);
        }
    }

    protected _error(err: any) {
        this.errored = true;
        this.queue = [];
        const destination = this.destination as Subscriber<any>;
        destination.error(err);
        this.unsubscribe();
    }

    protected _complete() {
        this.scheduleNotification(Notification.createComplete(), DelayBehavior.NoDelay);
        this.unsubscribe();
    }

    protected _unsubscribe() {
        (this.delay as any) = null;
    }

    notifyComplete(innerSub: Subscription): void {
        const destination = this.destination as Subscription;
        destination.remove(innerSub);
    }

    notifyNext(outerValue: T, innerValue: number,
               outerIndex: number, innerIndex: number,
               innerSub: InnerSubscriber<T, number>): void {
        this.delayValue = innerValue;

        if (this.active && this.scheduledSub) {
            this.scheduledSub.unsubscribe();
            this._schedule(this.scheduler);
        }
    }
}

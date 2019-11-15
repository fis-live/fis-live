import {
    asyncScheduler,
    MonoTypeOperatorFunction,
    Notification,
    Observable, ObservableInput,
    Operator,
    PartialObserver,
    SchedulerAction,
    SchedulerLike,
    Subscriber, Subscription,
    TeardownLogic
} from 'rxjs';
import { InnerSubscriber, OuterSubscriber, subscribeToResult } from 'rxjs/internal-compatibility';

export function delayBy<T>(delay: ObservableInput<number>,
                         scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => source.lift(new DelayByOperator(delay, scheduler));
}

class DelayByOperator<T> implements Operator<T, T> {
    constructor(private delay: ObservableInput<number>,
                private scheduler: SchedulerLike) {
    }

    call(subscriber: Subscriber<T>, source: any): TeardownLogic {
        return source.subscribe(new DelayBySubscriber(subscriber, this.delay, this.scheduler));
    }
}

interface DelayState<T> {
    source: DelayBySubscriber<T>;
    destination: PartialObserver<T>;
    scheduler: SchedulerLike;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DelayBySubscriber<T> extends OuterSubscriber<T, number> {
    private queue: Array<DelayMessage<T>> = [];
    private active: boolean = false;
    private errored: boolean = false;
    private scheduledSub!: Subscription;
    private delayValue: number = 0;

    private static dispatch<T>(this: SchedulerAction<DelayState<T>>, state?: DelayState<T>): void {
        const source = state!.source;
        const queue = source.queue;
        const scheduler = state!.scheduler;
        const destination = state!.destination;

        while (queue.length > 0 && (queue[0].time + source.delayValue - scheduler.now()) <= 0) {
            queue.shift()!.notification.observe(destination);
        }

        if (queue.length > 0) {
            const delay = Math.max(0, queue[0].time + source.delayValue - scheduler.now());
            this.schedule(state, delay);
        } else {
            this.unsubscribe();
            source.active = false;
            // delete source.scheduledSub;
        }
    }

    constructor(destination: Subscriber<T>,
                private delay: ObservableInput<number>,
                private scheduler: SchedulerLike) {
        super(destination);
        this._innerSub(delay);
    }

    private _schedule(scheduler: SchedulerLike): void {
        this.active = true;
        const delay = Math.max(0, this.queue[0].time + this.delayValue - scheduler.now());
        this.add(this.scheduledSub = scheduler.schedule<DelayState<T>>(DelayBySubscriber.dispatch, delay, {
            source: this, destination: this.destination, scheduler: scheduler
        }));
    }

    private scheduleNotification(notification: Notification<T>): void {
        if (this.errored === true) {
            return;
        }

        const scheduler = this.scheduler;
        const message = new DelayMessage(scheduler.now(), notification);
        this.queue.push(message);

        if (this.active === false) {
            this._schedule(scheduler);
        }
    }

    protected _next(value: T) {
        this.scheduleNotification(Notification.createNext(value));
    }

    protected _error(err: any) {
        this.errored = true;
        this.queue = [];
        this.destination.error!(err);
    }

    protected _complete() {
        this.scheduleNotification(Notification.createComplete());
    }

    private _innerSub(result: ObservableInput<number>) {
        this.add(subscribeToResult(this, result));
    }

    notifyComplete(innerSub: Subscription): void {
        this.remove(innerSub);
    }

    notifyNext(outerValue: T, innerValue: number,
               outerIndex: number, innerIndex: number,
               innerSub: InnerSubscriber<T, number>): void {
        this.delayValue = innerValue;
        if (this.active) {
            this.scheduledSub.unsubscribe();
            this.remove(this.scheduledSub);
            this._schedule(this.scheduler);
        }
    }
}

class DelayMessage<T> {
    constructor(public readonly time: number,
                public readonly notification: Notification<T>) {
    }
}

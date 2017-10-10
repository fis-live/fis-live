import { Observable as Obs } from 'rxjs/Observable';
import { timeoutInterval, TimeoutIntervalSignature } from '../timeoutInterval';

Obs.prototype.timeoutInterval = timeoutInterval;

declare module 'rxjs/Observable' {
    interface Observable<T> {
        timeoutInterval: TimeoutIntervalSignature<T>;
    }
}

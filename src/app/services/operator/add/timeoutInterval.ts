import { Observable } from 'rxjs/Observable';
import { timeoutInterval, TimeoutIntervalSignature } from '../timeoutInterval';

Observable.prototype.timeoutInterval = timeoutInterval;

declare module 'rxjs/Observable' {
    interface Observable<T> {
        timeoutInterval: TimeoutIntervalSignature<T>;
    }
}

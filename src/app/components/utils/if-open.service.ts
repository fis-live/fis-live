import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class IfOpenService {
    private _openChange: Subject<boolean> = new Subject<boolean>();
    private _open: boolean;

    public get openChange(): Observable<boolean> {
        return this._openChange.asObservable();
    }

    public set open(value: boolean) {
        value = !!value;
        if (this._open !== value) {
            this._open = value;
            this._openChange.next(value);
        }
    }

    public get open(): boolean {
        return this._open;
    }
}

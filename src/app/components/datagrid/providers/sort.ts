import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class Sort {
    public reverse = false;
    public comparator: string;

    private _change = new BehaviorSubject<null>(null);

    private getData(item: any, property: string): any {
        let value = item;
        for (const nestedProp of property.split('.')) {
            if (value == null || typeof value === 'undefined' || typeof value[nestedProp] === 'undefined') {
                return undefined;
            }

            value = value[nestedProp];
        }

        return value;
    }

    private emitChange() {
        this._change.next(null);
    }

    public get change(): Observable<null> {
        return this._change.asObservable();
    }

    public toggle(sortBy: string) {
        if (this.comparator === sortBy) {
            this.reverse = !this.reverse;
        } else {
            this.comparator = sortBy;
            this.reverse = false;
        }

        this.emitChange();
    }

    public compare(a: any, b: any): number {
        const propA = this.getData(a, this.comparator);
        const propB = this.getData(b, this.comparator);

        if (typeof propA === 'undefined' || propA === null) {
            if (typeof propB === 'undefined' || propB === null) {
                return 0;
            }

            return this.reverse ? -1 : 1;
        } else {
            if (typeof propB === 'undefined' || propB === null) {
                return this.reverse ? 1 : -1;
            } else if (propA < propB) {
                return this.reverse ? 1 : -1;
            } else if (propA > propB) {
                return this.reverse ? -1 : 1;
            }
        }

        return 0;
    }
}

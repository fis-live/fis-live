import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

@Injectable()
export class Sort {
    public reverse = false;
    public comparator: string;

    private _change = new Subject<Sort>();

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
        this._change.next(this);
    }

    public get change(): Observable<Sort> {
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
        if (this.getData(a, this.comparator) > this.getData(b, this.comparator)) {
            return this.reverse ? -1 : 1;
        } else if (this.getData(a, this.comparator) < this.getData(b, this.comparator)) {
            return this.reverse ? 1 : -1;
        }

        return 0;
    }
}

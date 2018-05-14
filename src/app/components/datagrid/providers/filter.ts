import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { Filter } from '../interfaces/filter';


interface FilterWithSub {
    filter: Filter;
    subscription: Subscription;
}

@Injectable()
export class Filters {
    private _change = new Subject<any>();

    public get change(): Observable<any> {
        return this._change.asObservable();
    }

    private _all: FilterWithSub[] = [];

    public hasActiveFilters(): boolean {
        // We do not use getActiveFilters() because this function will be called much more often
        // and stopping the loop early might be relevant.
        for (const {filter} of this._all) {
            if (filter && filter.isActive()) {
                return true;
            }
        }
        return false;
    }

    public add(filter: Filter): () => void {
        const index = this._all.length;
        const subscription = filter.changes.subscribe(() => this._change.next());
        this._all.push({filter, subscription});

        return () => {
            subscription.unsubscribe();
            this._all.splice(index, 1);
            this._change.next();
        };
    }

    /**
     * Accepts an item if it is accepted by all currently active filters
     */
    public accepts(item: any): boolean {
        for (const {filter} of this._all) {
            if (filter && filter.isActive() && !filter.accepts(item)) {
                return false;
            }
        }

        return true;
    }
}

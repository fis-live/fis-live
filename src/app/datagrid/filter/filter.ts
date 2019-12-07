import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExactFilter<T> {
    filterBy: (option: T) => string;
    term: string;
    isExact: boolean;
}

@Injectable()
export class NewFilter<T> {
    private readonly _change = new BehaviorSubject<void>(undefined);
    public filters: ExactFilter<T>[] = [];

    public get change(): Observable<void> {
        return this._change.asObservable();
    }

    public toggle(filter: ExactFilter<T>) {
        const idx = this.filters.findIndex((flt) => flt.term === filter.term);
        if (idx >= 0) {
            this.filters.splice(idx, 1);
        } else {
            this.filters.push(filter);
        }
        console.log(this.filters);

        this._change.next();
    }

    /**
     * Accepts an item if it is accepted by all currently active filters
     */
    public accepts(item: T): boolean {
        for (const filter of this.filters) {
            const data = filter.filterBy(item);
            console.log(data);
            if ((filter.isExact && data === filter.term) || data.toLowerCase().indexOf(filter.term.toLowerCase()) >= 0) {
                return true;
            }
        }

        return false;
    }

    hasActiveFilters() {
        return this.filters.length > 0;
    }
}

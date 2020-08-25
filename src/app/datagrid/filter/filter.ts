import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class Filter<T> {
    private readonly _change = new BehaviorSubject<void>(undefined);
    public terms: string[] = [];

    public get change(): Observable<void> {
        return this._change.asObservable();
    }

    public addTerm(term: string) {
        const idx = this.terms.indexOf(term);
        if (idx === -1) {
            this.terms.push(term);
            this._change.next();
        }
    }

    public removeTerm(term: string) {
        const idx = this.terms.indexOf(term);
        if (idx >= 0) {
            this.terms.splice(idx, 1);
            this._change.next();
        }
    }

    private getData(item: any, property: string): any {
        let value = item;
        for (const nestedProp of property.split('.')) {
            if (value == null || typeof value === 'undefined' || typeof value[nestedProp] === 'undefined') {
                return undefined;
            }

            value = (nestedProp === '') ? value : value[nestedProp];
        }

        return value;
    }

    public accepts(data: T, keys: string[]): boolean {
        // Transform the data into a lowercase string of all property values.
        const dataStr = keys.reduce((currentTerm: string, key: string) => {
            return currentTerm + this.getData(data, key) + '◬';
            }, '').toLowerCase();

        for (const term of this.terms) {
            const transformedFilter = term.trim().toLowerCase();

            if (dataStr.indexOf(transformedFilter) !== -1) {
                return true;
            }
        }

        return false;
    }

    public hasActiveFilters() {
        return this.terms.length > 0;
    }
}

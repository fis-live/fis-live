import { Observable } from 'rxjs/Observable';

export interface Filter {
    changes: Observable<any>;
    accepts(item: any): boolean;
    isActive(): boolean;
}

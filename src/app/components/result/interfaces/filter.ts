import { Observable } from 'rxjs/Rx';

export interface Filter {
    accepts(item: any): boolean;
    isActive(): boolean;
    changes: Observable<any>;
}
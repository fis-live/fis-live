import { Observable } from 'rxjs/Rx';

export interface Filter {
    changes: Observable<any>;
    accepts(item: any): boolean;
    isActive(): boolean;
}

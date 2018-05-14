import { Observable } from 'rxjs';

export interface Filter {
    changes: Observable<any>;
    accepts(item: any): boolean;
    isActive(): boolean;
}

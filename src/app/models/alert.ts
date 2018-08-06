import { Action } from '@ngrx/store';

export interface Alert {
    message: string;
    severity: string;
    action: string;
    actions: Action[];
}

import { Action } from '@ngrx/store';

export const enum LoadingActionTypes {
    ShowLoading = '[Loading] Show loading indicator',
    HideLoading = '[Loading] Hide loading indicator'
}
export class ShowLoading implements Action {
    readonly type = LoadingActionTypes.ShowLoading;

    constructor() { }
}

export class HideLoading implements Action {
    readonly type = LoadingActionTypes.HideLoading;

    constructor() { }
}

export type LoadingAction
    = ShowLoading
    | HideLoading;

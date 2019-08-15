import { createAction } from '@ngrx/store';

export const showLoading = createAction(
    '[Loading] Show loading indicator'
);

export const hideLoading = createAction(
    '[Loading] Hide loading indicator'
);

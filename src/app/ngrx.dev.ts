import { StoreDevtoolsModule } from '@ngrx/store-devtools';

let NGRX_TOOLS;
if (process.env.ENV === 'production') {
    NGRX_TOOLS = [];
} else {
    NGRX_TOOLS = [
        StoreDevtoolsModule.instrumentOnlyWithExtension()
    ];
}

export const DEV_TOOLS = NGRX_TOOLS;
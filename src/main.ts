import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication, Title } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideScrollbarOptions } from 'ngx-scrollbar';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/routes';
import { ConnectionEffects } from './app/state/connection-effects';
import { metaReducers, reducers } from './app/state/reducers';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
    providers: [
        Title,
        provideScrollbarOptions({
            appearance: 'compact',
            visibility: 'hover'
        }),
        provideStore(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true
            },
            metaReducers: metaReducers
        }),
        provideEffects([ConnectionEffects]),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(appRoutes, withHashLocation()),
        environment.providers
    ]
}).catch(err => console.error(err));

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication, Title } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/routes';
import { ConnectionEffects } from './app/state/connection-effects';
import { metaReducers, reducers } from './app/state/reducers';
import { devModules, environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(devModules),
        Title,
        {
            provide: NG_SCROLLBAR_OPTIONS,
            useValue: {
                track: 'all',
                visibility: 'hover'
            }
        },
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
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(appRoutes, withHashLocation())
    ]
}).catch(err => console.error(err));

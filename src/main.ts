import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import './app/rxjs-operators';

import 'jquery';
import 'semantic-ui/dist/components/transition.js';
import 'semantic-ui/dist/components/dropdown.js';
import 'semantic-ui/dist/components/modal.js';
import 'semantic-ui/dist/components/dimmer.js';

import 'semantic-ui/dist/semantic.css';
import './assets/css/style.less';

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
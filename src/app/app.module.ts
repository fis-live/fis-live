import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from "@angular/http";
import { FormsModule }   from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';

import { AppComponent } from './app.component';
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { RaceTabComponent } from "./race-tab.component";
import { TableComponent } from "./components/table/table.component";
import { reducer } from "./reducers";
import {ConnectionEffects} from "./effects/connection";
import { FisConnectionService } from "./services/fis-connection.service";
import { TimePipe } from "./pipes/time.pipe";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        StoreModule.provideStore(reducer),
        StoreDevtoolsModule.instrumentStore({
            monitor: useLogMonitor({
                visible: true,
                position: 'right'
            })
        }),
        StoreLogMonitorModule,
        EffectsModule.runAfterBootstrap(ConnectionEffects)
    ],
    declarations: [ AppComponent, DropdownComponent, TableComponent, RaceTabComponent, TimePipe ],
    bootstrap: [ AppComponent ],
    providers: [ FisConnectionService ]
})
export class AppModule { }

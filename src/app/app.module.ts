import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from "@angular/http";
import { FormsModule }   from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';

import { AppComponent } from './app.component';
import { DropdownComponent } from "./Dropdown/dropdown.component";
import { RaceTabComponent } from "./race-tab.component";
import { TableComponent } from "./Table/table.component";
import { reducer } from "./reducers";

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
        StoreLogMonitorModule
    ],
    declarations: [ AppComponent, DropdownComponent, TableComponent, RaceTabComponent ],
    bootstrap: [ AppComponent ],
    providers: []
})
export class AppModule { }

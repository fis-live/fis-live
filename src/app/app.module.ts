import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from "@angular/http";
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from "@angular/router";

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { RaceTabComponent } from "./components/race-tab.component";
import { TableComponent } from "./components/table/table.component";
import { reducer } from "./reducers";
import { ConnectionEffects } from "./effects/connection";
import { FisConnectionService } from "./services/fis-connection.service";
import { ContainerComponent } from "./components/container.component";
import { DimensionsDirective } from "./components/DimensionsDirective";

const appRoutes: Routes = [
    { path: ':codex', component: ContainerComponent },
    { path: '**', component: ContainerComponent }
];
@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(appRoutes, { useHash: true }),
        StoreModule.provideStore(reducer),
        EffectsModule.runAfterBootstrap(ConnectionEffects),
        StoreDevtoolsModule.instrumentOnlyWithExtension()
    ],
    declarations: [ AppComponent, DropdownComponent, TableComponent, RaceTabComponent, ContainerComponent, DimensionsDirective ],
    bootstrap: [ AppComponent ],
    providers: [ FisConnectionService ]
})
export class AppModule { }

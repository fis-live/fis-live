import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from "@angular/http";
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { DropdownComponent } from "./Dropdown/dropdown.component";
import { RaceTabComponent } from "./race-tab.component";
import { TableComponent } from "./Table/table.component";

@NgModule({
    imports: [ BrowserModule, HttpModule, FormsModule ],
    declarations: [ AppComponent, DropdownComponent, TableComponent, RaceTabComponent ],
    bootstrap: [ AppComponent ],
    providers: []
})
export class AppModule { }

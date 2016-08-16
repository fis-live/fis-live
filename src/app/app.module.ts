import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from "@angular/http";
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { DropdownComponent } from "./Dropdown/dropdown.component";

@NgModule({
    imports: [ BrowserModule, HttpModule, FormsModule ],
    declarations: [ AppComponent, DropdownComponent],
    bootstrap: [ AppComponent ],
    providers: []
})
export class AppModule { }

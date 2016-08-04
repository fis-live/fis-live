import { Component, OnInit } from '@angular/core';

import './rxjs-operators';

import { FisConnectionService } from "./Connection/fis-connection.service";
import { DropdownComponent } from "./Dropdown/dropdown.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    directives: [DropdownComponent],
    providers: [FisConnectionService]
})
export class AppComponent implements OnInit {
    public title: string = "Hello World!!!";
    public id: string = 'dropdown';
    public items: any = [{id: '1', distance: '2 km', name: 'Inter 1'}, {id: '2', distance: '5 km', name: 'Finish'}];

    ngOnInit() {
        this.connection.getServerList();
    }

    constructor(private connection: FisConnectionService) {

    }

    public onChange(value: any): void {
        console.log(value);
    }
}

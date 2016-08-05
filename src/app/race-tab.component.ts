import { Component, Input, OnDestroy } from '@angular/core';
import { RaceModel } from './Model/race-model';
import { DropdownComponent } from './Dropdown/dropdown.component';
import { TableComponent } from './Table/table.component';

@Component({
    selector: 'app-tab',
    template: `<app-dropdown [id]="id" [items]="raceModel.getIntermediates(0)" (selected)="onChange($event)"></app-dropdown>
        <div class="ui attached segment">
        <app-table [startList]="raceModel.getStartList()"></app-table>
            </div>`,
    directives: [TableComponent, DropdownComponent]
})
export class RaceTabComponent implements OnDestroy {
    ngOnDestroy() {
        console.log('Destroy' + this.id);
    }
    public codex;
    public run: number;
    public intermediate: number;

    @Input()
    public raceModel: RaceModel;

    @Input()
    public id: string;

    public onChange($event: any) {
        console.log($event);
    }
}
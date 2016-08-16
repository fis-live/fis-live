import { Component, Input, OnDestroy } from '@angular/core';
import { RaceModel } from './Model/race-model';

@Component({
    selector: 'app-tab',
    template: `<app-dropdown [id]="id" [items]="raceModel.getIntermediates(0)" (selected)="onChange($event)"></app-dropdown>
        <div class="ui attached segment">
        <app-table></app-table>
            </div>`
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
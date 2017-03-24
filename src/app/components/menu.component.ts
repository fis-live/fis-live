import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import { State as RaceInfoState } from '../state/reducers/race-info';

@Component({
    selector: 'app-menu',
    template: `
<div class="ui top inverted menu fixed"  style="background-color: #004A70;">
    <div class="item header-hamburger-trigger" (click)="openSidebar.emit(null)"><span></span></div>
    <div class="borderless item">{{ raceInfo.info.eventName }}</div>
    <div class="borderless fitted small item">{{ raceInfo.info.raceName}}</div>
    <div class="right menu">
        <div class="borderless item">{{ raceInfo.message | uppercase }}</div>
        <div (click)="refresh.emit(null)" style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger">
            <clr-icon shape="refresh"></clr-icon>
        </div>
        <div (click)="tab.emit('remove')" style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger">
            <clr-icon size="20" shape="minus"></clr-icon>
        </div>
        <div (click)="tab.emit('add')" style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger">
            <clr-icon size="20" shape="plus"></clr-icon>
        </div>
    </div>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {

    @Input()
    public raceInfo: RaceInfoState;

    @Output()
    public refresh: EventEmitter<any> = new EventEmitter();

    @Output()
    public tab: EventEmitter<string> = new EventEmitter();

    @Output()
    public openSidebar: EventEmitter<any> = new EventEmitter();
}

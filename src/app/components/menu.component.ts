import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

import { RaceInfo } from '../models/race-info';

@Component({
    selector: 'app-menu',
    template: `
<div class="ui top inverted menu fixed"  style="background-color: #004A70;">
    <div class="item header-hamburger-trigger" (click)="openSidebar.emit(null)"><span></span></div>
    <div class="borderless item">{{ raceInfo.info.eventName }}</div>
    <div class="borderless fitted small item">{{ raceInfo.info.raceName}}</div>
    <div class="right menu">
        <div class="borderless item">{{ raceInfo.message | uppercase }}</div>
        <div style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger"><clr-icon (click)="refresh.emit(null)" shape="refresh"></clr-icon></div>
        <div style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger"><clr-icon size="20" (click)="tab.emit('remove')" shape="minus"></clr-icon></div>
        <div style="padding-bottom: 0; padding-top: 0;" class="item header-hamburger-trigger"><clr-icon size="20" (click)="tab.emit('add')" shape="plus"></clr-icon></div>
    </div>
</div>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {

    @Input()
    public raceInfo: RaceInfo;

    @Output()
    public refresh: EventEmitter<any> = new EventEmitter();

    @Output()
    public tab: EventEmitter<string> = new EventEmitter();

    @Output()
    public openSidebar: EventEmitter<any> = new EventEmitter();
}

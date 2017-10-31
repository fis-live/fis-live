import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { State as RaceInfoState } from '../state/reducers/race-info';

@Component({
    selector: 'app-menu',
    template: `
        <header class="header-6" style="background-color: #004A70;">
            <div class="branding" (click)="openSidebar.emit(null)"><button class="header-hamburger-trigger" type="button">
                <span></span>
            </button></div>
            <div class="header-nav">
                <div class="nav-text">{{ raceInfo.info.eventName }}</div>
                <div class="nav-text">{{ raceInfo.info.raceName }}</div>
                <div class="nav-text">{{ raceInfo.message | uppercase }}</div>
            </div>
    <div class="header-actions">
        <a (click)="refresh.emit(null)" style="padding-bottom: 0; padding-top: 0;" class="nav-link nav-icon">
            <clr-icon shape="refresh"></clr-icon>
        </a>
        <a (click)="tab.emit('remove')" class="nav-link nav-icon">
            <clr-icon size="20" shape="minus"></clr-icon>
        </a>
        <a (click)="tab.emit('add')"  class="nav-link nav-icon">
            <clr-icon size="20" shape="plus"></clr-icon>
        </a>
    </div>
</header>
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

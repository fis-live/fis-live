import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { State as RaceInfoState } from '../state/reducers/race-info';

@Component({
    selector: 'app-menu',
    template: `
        <header>
            <div class="branding" (click)="openSidebar.emit()">
                <button class="header-hamburger-trigger" type="button">
                    <span></span>
                </button>
            </div>
            <div class="header-nav" *ngIf="raceInfo as race">
		        <span>
		            <span class="event-name">{{ race.info.eventName }}</span><br>
		            <span class="race-name">{{ race.info.raceName }}</span>
		        </span>
                <span class="message">{{ race.message | uppercase }}</span>
            </div>
            <div class="header-actions">
                <a (click)="refresh.emit()" class="nav-link nav-icon">
                    <clr-icon shape="refresh"></clr-icon>
                </a>
                <a (click)="tab.emit('remove')" class="nav-link nav-icon no-mobile">
                    <clr-icon shape="minus"></clr-icon>
                </a>
                <a (click)="tab.emit('add')"  class="nav-link nav-icon no-mobile">
                    <clr-icon shape="plus"></clr-icon>
                </a>
            </div>
        </header>
`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {

    @Input()
    public raceInfo: RaceInfoState | null = null;

    @Output()
    public refresh: EventEmitter<void> = new EventEmitter();

    @Output()
    public tab: EventEmitter<"add" | "remove"> = new EventEmitter();

    @Output()
    public openSidebar: EventEmitter<void> = new EventEmitter();
}

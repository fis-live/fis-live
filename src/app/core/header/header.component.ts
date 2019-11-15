import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { State as RaceInfoState } from '../../state/reducers/race-info';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    @Input()
    public raceInfo: RaceInfoState | null = null;

    @Output()
    public refresh: EventEmitter<void> = new EventEmitter();

    @Output()
    public tab: EventEmitter<'add' | 'remove'> = new EventEmitter();

    @Output()
    public openSidebar: EventEmitter<void> = new EventEmitter();
}

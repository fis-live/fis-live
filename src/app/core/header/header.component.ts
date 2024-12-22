import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

import { State as RaceInfoState } from '../../state/reducers/race-info';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IconComponent,
        UpperCasePipe
    ]
})
export class HeaderComponent {
    public readonly raceInfo = input<RaceInfoState>();

    public readonly mode  = model<boolean>(false);

    public readonly refresh = output();

    public readonly tab  = output<'add' | 'remove'>();

    public readonly openSidebar = output();
}

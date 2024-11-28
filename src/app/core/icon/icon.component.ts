/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'clr-icon',
    templateUrl: './icon.component.html',
    host: {
        '[style.width.px]': 'size()',
        '[style.height.px]': 'size()',
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
    public readonly shape = input('');

    public readonly size = input<number>();
}

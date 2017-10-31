/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
    selector: 'clr-icon',
    templateUrl: './icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
    @Input()
    public shape: string;

    @HostBinding('style.width.px')
    @HostBinding('style.height.px')
    @Input()
    public size: number;
}

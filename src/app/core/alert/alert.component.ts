import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Action } from '@ngrx/store';

import { State } from '../../state/reducers/alert';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IconComponent
    ],
    animations: [
        trigger('translate', [
            transition(':enter', [
                style({ transform: 'translateY(100%)' }),
                animate('600ms ease', style({ transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('600ms ease', style({ transform: 'translateY(100%)' }))
            ])
        ])
    ]
})
export class AlertComponent {
    public readonly alert = input<State>();

    public readonly close = output();

    public readonly action = output<Action[]>();

    protected readonly iconShape = computed(() => {
        switch (this.alert()?.severity) {
            case 'warning':
            case 'alert-warning':
                return 'exclamation-triangle';
            case 'danger':
            case 'alert-danger':
                return 'exclamation-circle';
            case 'success':
            case 'alert-success':
                return 'check-circle';
            default:
                return 'info-circle';
        }
    });
}

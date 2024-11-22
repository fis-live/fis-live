import { animate, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { Action } from '@ngrx/store';

import { Alert } from '../../state/reducers/alert';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
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
    @Input()
    public alert: Alert | null = null;

    @Output()
    public close: EventEmitter<void> = new EventEmitter();

    @Output()
    public action: EventEmitter<Action[]> = new EventEmitter();

    public closeAlert(): void {
        this.close.emit();
    }

    public emitAction(alert: Alert): void {
        this.action.emit(alert.actions);
    }

    public iconInfoFromType(type: string): string {
        switch (type) {
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
    }
}

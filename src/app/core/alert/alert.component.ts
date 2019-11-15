import { animate, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { Action } from '@ngrx/store';

import { Alert } from '../../models/alert';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('translate', [
            transition(':enter', [
                style({transform: 'translateY(100%)'}),
                animate('600ms ease', style({transform: 'translateY(0)'}))
            ]),
            transition(':leave', [
                animate('600ms ease', style({transform: 'translateY(100%)'}))
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
        let shape: string;
        switch (type) {
            case 'warning':
            case 'alert-warning':
                shape = 'exclamation-triangle';
                break;
            case 'danger':
            case 'alert-danger':
                shape = 'exclamation-circle';
                break;
            case 'success':
            case 'alert-success':
                shape = 'check-circle';
                break;
            default:
                shape = 'info-circle';
                break;
        }

        return shape;
    }
}

import { animate, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { Action } from '@ngrx/store';

import { State as AlertState } from '../../state/reducers/alert';


@Component({
    selector: 'app-alert',
    template: `
        <div *ngIf="alert.isOpen" [@translate] [ngClass]="'alert alert-app-level alert-' + alert.severity" >
            <div class="alert-items">
                <div class="alert-item">
                    <div class="alert-icon-wrapper">
                        <clr-icon class="alert-icon" [shape]="iconInfoFromType(alert.severity)"></clr-icon>
                    </div>

                    <div class="alert-text">
                        {{ alert.message }}
                    </div>

                    <div class="alert-actions">
                        <button class="btn alert-action" (click)="emitAction(alert)">{{ alert.action }}</button>
                    </div>
                </div>
            </div>

            <button type="button" class="close" aria-label="Close" (click)="closeAlert()">
                <clr-icon aria-hidden="true" shape="times"></clr-icon>
            </button>
        </div>`,
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
    ],
})
export class AlertComponent {

    @Input()
    public alert: AlertState;

    @Output()
    public close: EventEmitter<any> = new EventEmitter();

    @Output()
    public action: EventEmitter<Action[]> = new EventEmitter();

    public closeAlert(): void {
        this.close.emit(null);
    }

    public emitAction(alert: AlertState): void {
        this.action.emit(alert.actions);
    }

    public iconInfoFromType(type: string, classOrShape: string = 'shape'): string {
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

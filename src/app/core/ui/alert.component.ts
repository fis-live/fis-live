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
    template: `
        <div *ngIf="alert as _alert" [@translate] [ngClass]="'alert alert-app-level alert-' + _alert.severity" >
            <div class="alert-items">
                <div class="alert-item">
                    <div class="alert-icon-wrapper">
                        <clr-icon class="alert-icon" [shape]="iconInfoFromType(_alert.severity)"></clr-icon>
                    </div>

                    <div class="alert-text">
                        {{ _alert.message }}
                    </div>

                    <div class="alert-actions">
                        <button class="btn alert-action" (click)="emitAction(_alert)">{{ _alert.action }}</button>
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

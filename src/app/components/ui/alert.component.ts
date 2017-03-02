import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    EventEmitter
} from '@angular/core';
import { style, animate, trigger, transition } from '@angular/animations';
import { Action } from '@ngrx/store';
import { State as AlertState } from '../../state/reducers/alert';


@Component({
    selector: 'app-alert',
    template: `<div *ngIf="alert.isOpen" [@translate] [ngClass]="'alert alert-app-level alert-' + alert.severity" >
    <button type="button" class="close" aria-label="Close" (click)="closeAlert()">
    <clr-icon shape="times">
    </clr-icon>
    </button>

    <div class="alert-item">
    <div class="alert-text">
        {{ alert.message }}
</div>
<div class="alert-actions">
<button class="btn alert-action" (click)="emitAction(alert)">{{ alert.action }}</button>
</div>
</div>
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
}

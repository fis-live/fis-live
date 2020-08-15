import { animate, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    OnInit,
    Renderer2,
    TemplateRef
} from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { AbstractPopover } from '../../utils/abstract-popover';

import { KeysOfType, Option, OptionSelector } from './option-selector';

export const APP_OPTIONS = new InjectionToken<OptionSelector<any, any>>('app.options');

@Component({
    selector: 'app-select',
    templateUrl: './select.html',
    host : {
        '[class.dropdown]': 'true'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animate', [
            transition(':enter', [
                style({opacity: 0, transform: 'scaleY(0)'}),
                animate('200ms ease', style({opacity: 1, transform: 'scaleY(1)'}))
            ]),
            transition(':leave', [
                animate('200ms ease', style({opacity: 0, transform: 'scaleY(0)'}))
            ])
        ])
    ]
})
export class SelectComponent<T, V> extends AbstractPopover implements OnInit {
    @Input() key!: KeysOfType<T, V>;

    @ContentChild(TemplateRef, {static: true}) template!: TemplateRef<{$implicit: V}>;
    options!: Observable<Option<V>[]>;
    render!: Observable<V | null>;

    constructor(@Inject(APP_OPTIONS) private provider: OptionSelector<T, V>, el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef) {
        super(el, renderer, cdr);
    }

    ngOnInit() {
        this.options = this.provider.getOptions().pipe(pluck(this.key));
        this.render = this.provider.getRenderSelectionChanged().pipe(pluck(this.key));
    }

    public select(item: Option<V>) {
        if (!item.disabled) {
            this.provider.updateSelection(item.value, this.key);
            this.toggle();
        }
    }
}

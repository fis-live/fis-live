import {
    Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy, ElementRef, ViewChild
} from '@angular/core';

@Component({
    selector: 'app-dropdown',
    template: `
<div #dropdown class="ui top attached primary dropdown button">
    <div class="default text">Select intermediate</div>
    <i class="dropdown icon"></i>
    
    <div class="menu">
        <div class="item" data-value="start_list">Start list</div>
        <div *ngFor="let item of items" class="item" [attr.data-value]="item.id" [attr.data-text]="item.distance + ' KM'">{{ item.name }}  {{ item.distance }} KM</div>
    </div>
</div>`
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
    @Input()
    public items: any = [];

    @Output()
    public selected:EventEmitter<any> = new EventEmitter();

    @ViewChild('dropdown')
    private element: ElementRef;

    private $el: any;

    ngAfterViewInit() {
        this.$el = jQuery(this.element.nativeElement);

        this.$el.dropdown({
            onChange: (value) => this.selected.emit(value),
            allowTab: false
        });

        this.$el.dropdown('refresh');
        this.$el.dropdown('set selected', 'start_list');
    }

    ngOnDestroy() {
        this.$el.dropdown('destroy');
    }
}
import {
    Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy
} from '@angular/core';

@Component({
    selector: 'app-dropdown',
    template: `
<div [attr.id]="id" class="ui top attached primary dropdown button" tabindex="0">
    <div class="default text">Select intermediate</div>
    <i class="dropdown icon"></i>
    
    <div class="menu">
        <div class="item" data-value="0">Start list</div>
        <div *ngFor="let item of items" class="item" [attr.data-value]="item.id" [attr.data-text]="item.distance + ' KM'">{{ item.name }}  {{ item.distance }} KM</div>
    </div>
</div>`
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
    @Input()
    public items: any = [];

    @Input()
    public id: string;

    @Output()
    public selected:EventEmitter<any> = new EventEmitter();

    private $el: any;

    ngAfterViewInit() {
        // viewChild is set after the view has been initialized
        console.log(this.id);

        if (typeof jQuery === "undefined") {
            console.log("jQuery is not loaded");
            return;
        }

        this.$el = jQuery('#' + this.id);
        console.log(this.$el);

        this.$el.dropdown({
            onChange: (value) => this.selected.emit(value)
        });

        this.$el.dropdown('refresh');
        this.$el.dropdown('set selected', '0');
    }

    ngOnDestroy() {
        console.log('Destroy' + this.id);
        this.$el.dropdown('destroy');
    }
}
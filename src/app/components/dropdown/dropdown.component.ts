import {
    Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy, ElementRef, ViewChild
} from '@angular/core';

@Component({
    selector: 'app-dropdown',
    template: `
<div class="ui top attached buttons" >
    <div #dropdown class="ui primary dropdown button">
        <div class="default text">Select intermediate</div>
        <i class="dropdown icon"></i>
        
        <div class="menu">
            <div class="item" data-value="0">Start list</div>
            <div *ngFor="let item of items" class="item" [attr.data-value]="item.id" [attr.data-text]="item.distance + ' KM'">{{ item.name }}  {{ item.distance }} KM</div>
        </div>
    </div>
    
    <div #compare class="ui positive dropdown button">
        <div class="default text">Compare...</div>
        <i class="dropdown icon"></i>
        
        <div class="menu">
            <div class="item" data-value="0">From start</div>
            <div *ngFor="let item of compareItems" class="item" [attr.data-value]="item.id" [attr.data-text]="item.distance + ' KM'">{{ item.name }}  {{ item.distance }} KM</div>
        </div>
    </div>
</div>`
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
    public _items;

    @Input()
    public set items(item: any[]) {
        this._items = item;
        this.compareItems = [];
    }

    public get items() {
        return this._items;
    }

    public compareItems: any = [];

    private inter: number;
    private comparison: number = null;

    @Output()
    public selected: EventEmitter<{inter: number, compare: number}> = new EventEmitter();

    @ViewChild('dropdown')
    private element: ElementRef;

    @ViewChild('compare')
    private compare: ElementRef;

    private $el: any;
    private $comp: any;

    ngAfterViewInit() {
        this.$el = jQuery(this.element.nativeElement);
        this.$comp = jQuery(this.compare.nativeElement);

        this.$el.dropdown({
            onChange: (value) => {
                value = Number(value);
                if (this.comparison >= value) {
                    this.comparison = null;
                    this.$comp.dropdown('restore placeholder text');
                }
                this.compareItems = this.items.filter((item) => item.id < value);
                this.inter = value;
                this.$comp.dropdown('refresh');

                console.log({inter: value, compare: this.comparison});

                this.selected.emit({inter: value, compare: this.comparison});
            },
            allowTab: false
        });

        this.$comp.dropdown({
            onChange: (value) => {
                value = Number(value);
                this.comparison = value;

                console.log({inter: this.inter, compare: value});
                this.selected.emit({inter: this.inter, compare: value});
            },
            allowTab: false
        });

        this.$el.dropdown('refresh');
        this.$el.dropdown('set selected', '0');
    }

    ngOnDestroy() {
        this.$el.dropdown('destroy');
        this.$comp.dropdown('destroy');
    }
}
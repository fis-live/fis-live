import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export enum DatagridMode {
    StartList,
    Intermediate,
    Analysis
}

@Injectable()
export class DatagridState {
    private _change: Subject<any> = new Subject<any>();

    public get change(): Observable<any> {
        return this._change.asObservable();
    }

    public inter: number;
    public diff: number;
    public mode: DatagridMode;

    private _visibleColumns: string[] = ['rank', 'bib', 'name', 'time', 'nation', 'diff'];

    public setInter(inter: number): void {
        this.inter = inter;
        if (this.diff >= inter) {
            this.diff = null;
        }

        this._change.next({inter: this.inter, diff: this.diff, mode: this.mode, visibleColumns: this._visibleColumns});
    }

    public setDiff(diff: number): void {
        this.diff = diff;

        this._change.next({inter: this.inter, diff: this.diff, mode: this.mode, visibleColumns: this._visibleColumns});
    }

    public toggleColumn(column: string) {
        const i = this._visibleColumns.indexOf(column);
        if (i > -1) {
            this._visibleColumns.splice(i, 1);
        } else {
            this._visibleColumns.push(column);
        }

        this._change.next({inter: this.inter, diff: this.diff, mode: this.mode, visibleColumns: this._visibleColumns});
    }
}

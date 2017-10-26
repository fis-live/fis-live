import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

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
    public diff: number = 0;
    public mode: DatagridMode;

    private _visibleColumns: string[] = ['rank', 'bib', 'name', 'time', 'nation', 'diff'];

    public setInter(inter: number): void {
        this.inter = inter;
        if (this.diff >= inter) {
            this.diff = null;
        }

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
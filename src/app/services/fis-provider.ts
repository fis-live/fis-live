import { Action } from '@ngrx/store';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

export class FisService {
    private BASE_URL = 'https://fislive-cors.herokuapp.com';

    constructor(private _http: Http) { }

    loadMain(codex: number): Observable<Action[]> {
        return this._http.get(`${this.BASE_URL}/main.json?codex=${codex}`)
            .map((response) => response.json())
            .catch((error) => this.handleError(error))
            .timeout(10000)
            .retry(10);
    }

    loadUpdate(codex: number, update: number): Observable<Action[]> {
        return this._http.get(`${this.BASE_URL}/update.json?codex=${codex}&updt=${update}`)
            .map((response) => response.json())
            .catch((error) => this.handleError(error))
            .timeout(10000)
            .retry(10);
    }

    loadPdf(codex: number): Observable<Action[]> {
        return this._http.get(`${this.BASE_URL}/pdf.json?codex=${codex}`)
            .map((response) => response.json())
            .catch((error) => this.handleError(error))
            .timeout(10000)
            .retry(10);
    }

    loadRaces(): Observable<Action[]> {
        return this._http.get(`${this.BASE_URL}/liveraces.json`)
            .map((response) => response.json())
            .catch((error) => this.handleError(error))
            .timeout(10000)
            .retry(10);
    }

    private handleError(error: any): Observable<any> {

        const errMsg = (error instanceof Error) ? error :
            (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');

        return Observable.throw(errMsg);
    }
}

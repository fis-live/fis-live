// import { ChangeDetectionStrategy, Component } from '@angular/core';
//
// import { Http, Response } from '@angular/http';
// import { Router } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
//
// @Component({
//     selector: 'app-calendar',
//     template: `
//     <table>
//         <tr>
//             <th><div>Codex</div></th>
//             <th><div>Place</div></th>
//             <th><div>Nation</div></th>
//             <th><div>Category</div></th>
//             <th><div>CET Time</div></th>
//             <th><div>Status</div></th>
//
//         </tr>
//         <ng-template ngFor let-races [ngForOf]="upcomingRaces$ | async">
//             <tr class="date"><td colspan="6"><div> {{ races.date }}</div></td></tr>
//
//             <tr *ngFor="let race of races.races" (click)="go(race.codex)">
//                 <td><div>{{ race.codex }}</div></td>
//                 <td><div>{{ race.place }}</div></td>
//                 <td><div>{{ race.codex }}</div></td>
//                 <td><div>{{ race.category }}</div></td>
//                 <td><div>{{ race.time }}</div></td>
//                 <td><div>{{ race.status }}</div></td>
//             </tr>
//         </ng-template>
//     </table>
//     `,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class CalendarComponent {
//
//     public upcomingRaces$: Observable<any>;
//
//
//     constructor(private http: Http, private router: Router) {
//         this.upcomingRaces$ = this.loadRaces();
//     }
//
//     public go(codex: number): void {
//         this.router.navigate(['', codex]);
//     }
//
//     public loadRaces(): Observable<any> {
//         return this.http.get('https://fislive-cors.herokuapp.com/liveraces.json')
//             .map((response) => {
//                 const data = response.json();
//                 const ret = [];
//                 data.forEach((race) => {
//
//                     const i = ret.findIndex((row) => row.date === race.date);
//                     if (i === -1) {
//                         ret.push({
//                             date: race.date,
//                             races: [race]
//                         });
//                     } else {
//                         ret[i].races.push(race);
//                     }
//                 });
//
//                 return ret;
//             })
//             .catch((error) => {
//                 console.log(error);
//                 const errMsg = (error instanceof Error) ? error :
//                     (error instanceof Response) ? new Error(`${error.status} - ${error.statusText}`) : new Error('Server error');
//
//                 return Observable.throw(errMsg);
//             });
//     }
// }

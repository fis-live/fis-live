// import 'rxjs/Rx'; // adds ALL RxJS statics & operators to Observable

// See node_module/rxjs/Rxjs.js
// Import just the rxjs statics and operators we need for THIS app.

// Statics
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/timer';

// Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

import './Connection/operator/add/timeoutInterval';

import { Observable } from 'rxjs/Rx';
import { TimeInterval } from "rxjs/src/operator/timeInterval"
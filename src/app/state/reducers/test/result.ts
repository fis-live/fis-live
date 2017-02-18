// import { Action } from '@ngrx/store';
//
// import { RaceActions } from '../../actions';
//
// export interface Item {
//     racer: number;
//     time: number;
//     rank: number;
//     status: string;
//     diff: number[];
// }
//
// export interface State {
//     [intermediate: number]: Item[];
// }
//
// export function reducer(state: State = {[0]: []}, action: Action): State {
//     const maxVal = 1000000000;
//
//     switch (action.type) {
//         case RaceActions.ADD_START_LIST:
//             const entry = {
//                 racer: action.payload.racer,
//                 rank: action.payload.order,
//                 time: 0,
//                 status: action.payload.status,
//                 diff: [0]
//             };
//
//             return Object.assign({}, state, {[0]: state[0].concat(entry)});
//
//         case RaceActions.ADD_INTERMEDIATE:
//             return Object.assign({}, state, {[action.payload.id]: []});
//
//         case RaceActions.SET_STATUS:
//             const id: number = action.payload.id;
//             const newStatus: string = action.payload.status;
//
//             const _startList = state[0].map((row) => {
//                 const newRow = Object.assign({}, row);
//                 if (row.racer === id) {
//                     newRow.status = newStatus;
//                 }
//
//                 return newRow;
//             });
//
//
//             return Object.assign({}, state, {[0]: _startList});
//
//
//         case RaceActions.REGISTER_RESULT:
//             const item = action.payload;
//             const time = item.time || maxVal * 6;
//             const status = (item.time && item.status.length > 0) ? item.status : 'N/A';
//             const _diff = [];
//             const _state = Object.assign({}, state);
//             let rank = (item.time == null || item.time > maxVal) ? null : 1;
//             let duplicate = false;
//             let previousTime;
//
//             Object.keys(state).forEach((key) => {
//                 const index = state[key].findIndex((row) => row.racer === item.racer);
//
//                 if (index > -1 && key < item.intermediate) {
//                     if (time > maxVal || state[key][index].time > maxVal) {
//                         _diff[key] = maxVal;
//                     } else {
//                         _diff[key] = item.time - state[key][index].time;
//                     }
//                 } else if (index > -1 && key > item.intermediate) {
//                     if (time > maxVal || state[key][index].time > maxVal) {
//                         _state[key] = _state[key].map((r, idx) => {
//                             if (idx !== index) {
//                                 return r;
//                             }
//
//                             return {
//                                 status: r.status,
//                                 diff: r.diff.map((d, i) => i === item.intermediate ? maxVal : d),
//                                 racer: r.racer,
//                                 time: r.time,
//                                 rank: r.rank
//                             };
//                         });
//                     } else {
//                         _state[key] = _state[key].map((r, idx) => {
//                             if (idx !== index) {
//                                 return r;
//                             }
//
//                             return {
//                                 status: r.status,
//                                 diff: r.diff.map((d, i) => i === item.intermediate ? state[key][index].time - item.time : d),
//                                 racer: r.racer,
//                                 time: r.time,
//                                 rank: r.rank
//                             };
//                         });
//                     }
//                 } else if (index > -1 && key === item.intermediate) {
//                     duplicate = true;
//                     previousTime = state[key][index].time;
//                 } else if (index === -1 && key < item.intermediate) {
//                     _state[key] = _state[key].concat({
//                         racer: item.racer,
//                         time: time > maxVal ? time : maxVal * 6,
//                         status: status.length > 0 ? status : 'N/A',
//                         rank: null,
//                         diff: new Array<number>(+key).fill(maxVal)
//                     });
//
//                     _diff[key] = maxVal;
//                 }
//             });
//
//             if (state[item.intermediate] == null) {
//                 _state[item.intermediate] = [{
//                     status: status,
//                     diff: _diff,
//                     racer: item.racer,
//                     time: time,
//                     rank: rank
//                 }];
//
//                 return _state;
//             }
//
//             _state[item.intermediate] = state[item.intermediate].reduce((arr, row) => {
//                 if (row.racer === item.racer) {
//                     return arr;
//                 }
//
//                 if (row.rank == null) {
//                     return arr.concat(row);
//                 }
//
//                 if (rank && row.time < time) {
//                     rank += 1;
//                 }
//
//                 if (duplicate && previousTime < maxVal && previousTime < time) {
//                     if (row.time > time) {
//                         return arr.concat(row);
//                     }
//
//                     return arr.concat(Object.assign({}, row, {rank: row.rank - 1}));
//                 }
//
//                 if (row.time <= time) {
//                     return arr.concat(Object.assign({}, row));
//                 }
//
//                 return arr.concat(Object.assign({}, row, {rank: row.rank + 1}));
//             }, []);
//
//             _state[item.intermediate] = _state[item.intermediate].concat({
//                 racer: item.racer,
//                 time: time,
//                 status: status,
//                 diff: _diff,
//                 rank: rank
//             });
//
//             return _state;
//
//         default:
//             return state;
//     }
// }

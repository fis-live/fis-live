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
//     intermediate: number;
// }
//
// export interface State {
//     results: Item[];
//     intermediates: number[];
// }
//
// export function reducer(state: State = {results: [], intermediates: []}, action: Action): State {
//     const maxVal = 1000000000;
//     const getValidDiff = (time, zero) => {
//         if (time == null || zero == null) {
//             return maxVal;
//         } else if (time >= maxVal || zero >= maxVal) {
//             return maxVal;
//         }
//
//         return time - zero;
//     };
//
//     switch (action.type) {
//         case RaceActions.ADD_START_LIST:
//             const entry = {
//                 racer: action.payload.racer,
//                 rank: action.payload.order,
//                 intermediate: 0,
//                 time: 0,
//                 status: action.payload.status,
//                 diff: [0]
//             };
//
//             const newState = state.results.reduce((arr, row) => {
//                 const _row = Object.assign({}, row);
//                 if (row.intermediate === 0 && row.racer === entry.racer) {
//                     return arr;
//                 }
//
//                 return arr.concat(_row);
//             }, []);
//
//             return {
//                 intermediates: state.intermediates,
//                 results: newState.concat(entry)
//             };
//
//         case RaceActions.SET_STATUS:
//             const id: number = action.payload.id;
//             const newStatus: string = action.payload.status;
//
//             const _startList = state.results.map((row) => {
//                 const newRow = Object.assign({}, row);
//                 if (row.intermediate === 0 && row.racer === id) {
//                     newRow.status = newStatus;
//                 }
//
//                 return newRow;
//             });
//
//
//             return Object.assign({}, state, {results: _startList});
//
//         case RaceActions.ADD_INTERMEDIATE:
//             return Object.assign({}, state, {intermediates: state.intermediates.concat(action.payload.id)});
//
//
//         case RaceActions.REGISTER_RESULT:
//             const item = action.payload;
//             const time = item.time || maxVal * 6;
//             const status = (item.time && item.status.length > 0) ? item.status : 'N/A';
//             const _diff = [];
//             let _state: Item[] = [];
//             let rank = (item.time == null || item.time > maxVal) ? null : 1;
//             let duplicate = false;
//             let previousTime;
//
//             _state = state.results.reduce((arr, row) => {
//                 let _row = Object.assign({}, row);
//                 if (row.racer === item.racer) {
//                     if (row.intermediate > item.intermediate) {
//                         _row = Object.assign(_row, {diff: _row.diff.concat()});
//                         _row.diff[item.intermediate] = getValidDiff(row.time, item.time);
//                     } else if (row.intermediate === item.intermediate) {
//                         duplicate = true;
//                         previousTime = row.time;
//                         return arr;
//                     } else {
//                         _diff[row.intermediate] = getValidDiff(item.time, row.time);
//                     }
//                 } else {
//                     if (row.intermediate === item.intermediate) {
//                         if (rank && row.time < item.time) {
//                             rank += 1;
//                         } else if (row.rank && rank && row.time > item.time) {
//                             _row.rank += 1;
//                         }
//                     }
//                 }
//
//                 return arr.concat(_row);
//             }, []);
//
//             if (duplicate) {
//                 _state = _state.map((row) => {
//                     if (item.intermediate === row.intermediate && row.rank) {
//                         if (previousTime < maxVal && previousTime < row.time && row.time < maxVal) {
//                             if (row.time > time) {
//                                 return row;
//                             }
//
//                             return Object.assign(row, {rank: row.rank - 1});
//                         }
//                     }
//
//                     return row;
//                 });
//             }
//
//             state.intermediates.forEach((inter) => {
//                 if (inter < item.intermediate && !_diff[inter]) {
//                     _state.push({
//                         racer: item.racer,
//                         rank: null,
//                         time: time > maxVal ? time : maxVal * 6,
//                         status: status.length > 0 ? status : 'N/A',
//                         diff: (new Array<number>(inter)).fill(maxVal),
//                         intermediate: inter
//                     });
//                     _diff[inter] = maxVal;
//                 }
//             });
//
//             _state.push({
//                 racer: item.racer,
//                 rank: rank,
//                 time: time,
//                 status: status,
//                 diff: _diff,
//                 intermediate: item.intermediate
//             });
//
//             return Object.assign({}, state, {results: _state});
//
//         default:
//             return state;
//     }
// }

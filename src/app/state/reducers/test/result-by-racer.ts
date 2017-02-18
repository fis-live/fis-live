// import { Action } from '@ngrx/store';
//
// import { RaceActions } from '../../actions';
//
// export interface Item {
//     time: number;
//     status: string;
//     diff: number[];
// }
//
// export interface State {
//     results: {
//         [racer: number]: Item[];
//     };
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
//                 time: 0,
//                 status: action.payload.status,
//                 diff: [0]
//             };
//
//             if (state.results[action.payload.racer] == null) {
//                 return Object.assign({}, state, {
//                     results: Object.assign({}, state.results, {[action.payload.racer]: [entry]})
//                 });
//             }
//             const newState = state.results[action.payload.racer].map((row, index) => {
//                 if (index === 0) {
//                     return entry;
//                 }
//
//                 return row;
//             });
//
//             return Object.assign({}, state, {
//                 results: Object.assign({}, state.results, {[action.payload.racer]: newState})
//             });
//
//         case RaceActions.SET_STATUS:
//             const id: number = action.payload.id;
//             const newStatus: string = action.payload.status;
//
//             const _startList = state.results[id].map((row, index) => {
//                 const _row = Object.assign({}, row);
//                 if (index === 0) {
//                     _row.status = newStatus;
//                 }
//
//                 return _row;
//             });
//
//
//             return Object.assign({}, state, {
//                 results: Object.assign({}, state.results, {[action.payload.racer]: _startList})
//             });
//
//         case RaceActions.ADD_INTERMEDIATE:
//             return Object.assign({}, state, {intermediates: state.intermediates.concat(action.payload.id)});
//
//
//         case RaceActions.REGISTER_RESULT:
//             const item = action.payload;
//             const time = item.time || maxVal * 6;
//             const status = (item.time && item.status.length > 0) ? item.status : 'N/A';
//             const _diff = item.intermediate === 0 ? [item.time] : [];
//             let _state = [];
//             if (state.results[item.racer] == null) {
//                 _state[item.intermediate] = {status: status, time: time, diff: _diff};
//                 return Object.assign({}, state, {
//                     results: Object.assign({}, state.results, {[item.racer]: _state})
//                 });
//             }
//
//             _state = state.results[item.racer].map((row, index) => {
//                 if (row != null) {
//                     let _row = Object.assign({}, row);
//                     if (index < item.intermediate) {
//                         _diff[index] = getValidDiff(time, row.time);
//                     } else if (index === item.intermediate) {
//                         return _row;
//                     } else {
//                         _row = Object.assign(_row, {diff: _row.diff.concat()});
//                         _row.diff[item.intermediate] = getValidDiff(row.time, time);
//                         return _row;
//                     }
//                 }
//
//                 return row;
//             });
//
//             state.intermediates.forEach((inter) => {
//                 if (inter < item.intermediate && !_diff[inter]) {
//                     _state[inter] = {
//                         time: time > maxVal ? time : maxVal * 6,
//                         status: status.length > 0 ? status : 'N/A',
//                         diff: (new Array<number>(inter)).fill(maxVal),
//                     };
//                     _diff[inter] = maxVal;
//                 }
//             });
//
//             _state[item.intermediate] = {
//                 time: time,
//                 status: status,
//                 diff: _diff
//             };
//
//             return Object.assign({}, state, {
//                 results: Object.assign({}, state.results, {[item.racer]: _state})
//             });
//
//         default:
//             return state;
//     }
// }

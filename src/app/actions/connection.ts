import { Action } from '@ngrx/store';

export class ConnectionActions {
    static LOAD_SERVERS = '[Connection] Load servers';
    static LOAD_SERVERS_SUCCESS = '[Connection] Servers loaded succesfully';
    static LOAD_SERVERS_ERROR = '[Connection] Error on loading servers';
    static LOAD_MAIN = '[Connection] Load main';
    static LOAD_UPDATE = '[Connection] Load update';

    static STOP_UPDATE = '[Connection] Stop updating';

    static loadServerAction(): Action {
        return {type: ConnectionActions.LOAD_SERVERS};
    }

    static loadServerSuccessAction(): Action {
        return {type: ConnectionActions.LOAD_SERVERS_SUCCESS}
    }

    static loadServerErrorAction(): Action {
        return {type: ConnectionActions.LOAD_SERVERS_ERROR}
    }

    static loadMainAction(payload): Action {
        return {type: ConnectionActions.LOAD_MAIN, payload: payload}
    }

    static loadUpdateAction(): Action {
        return {type: ConnectionActions.LOAD_UPDATE}
    }

    static stopUpdateAction(): Action {
        return {type: ConnectionActions.STOP_UPDATE}
    }
}
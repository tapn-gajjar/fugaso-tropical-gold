import {WinSymbolDBase} from "../../casino/data/WinSymbolDBase";

export class WinSymbolD extends WinSymbolDBase{
    constructor() {
        super();
    }

    clear() {
        super.clear();
        this._multi = 0;
        this._wildMulti = 0;
    }

    set multi(value) {
        this._multi = value;
    }

    get multi() {
        return this._multi;
    }

    set wildMulti(value) {
        this._wildMulti = value;
    }

    get wildMulti() {
        return this._wildMulti;
    }
}
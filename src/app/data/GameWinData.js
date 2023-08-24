import {GameWinDataBase} from "../../casino/data/GameWinDataBase";

export class GameWinData extends GameWinDataBase {
    constructor() {
        super();
        this._multi = 1;
        this._points = null;
        this._wilds = null;
        this._indexes = null;
        this._removeScatterInRespin = false;
    }

    checkData(data) {
        super.checkData(data);
        this._multi = data.multi;
        this._points = data.points;
        this._wilds = data.wilds;
        this._indexes = data.indexes;
    }

    get multi() {
        return this._multi;
    }

    get points() {
        return this._points;
    }

    get wilds() {
        return this._wilds;
    }

    get indexes() {
        return this._indexes;
    }
}

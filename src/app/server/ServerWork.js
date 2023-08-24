import {ServerWorkBase} from "../../casino/server/ServerWorkBase";
import {AppG} from "../../casino/AppG";

export class ServerWork extends ServerWorkBase {
    constructor() {
        super();
        this._recoverMode = false;
    }

    gameConfHandler(e) {
        let packet = e.data;
        for (let i = 0; i < packet.wins.length; i++) {
            if (packet.wins[i].symbol === "G") {
                const win = OMY.OMath.jsonCopy(packet.wins[i]);
                win.symbol = "K";
                win.factor *= 2;
                packet.wins.push(win);
                break;
            }
        }
        super.gameConfHandler(e);
        this._multi = packet.result?.special?.multi || 1;
        this._haveWild = (packet.result?.special?.hasOwnProperty("feature")) ? packet.result?.special?.feature !== "?" : false;
        /*if (this._nextAct === AppConst.API_RESPIN) {
                   this._recoverMode = true;
                   this._updateWinData(packet);
                   if (AppG.gameHaveFree) {
                       let freeSpins = packet.free;
                       if (freeSpins?.initial) {
                           this._freeCatch = freeSpins.catch;
                           this._freeLastGame = freeSpins.last;
                           this._freeLeft = freeSpins.left;
                           this._reelFreeCat = freeSpins.category;
                           this._freeBonusSymbol = freeSpins.symbol;
                           this._countFreeGame = freeSpins.done;
                           this._totalFreeGame = freeSpins.initial;
                           this._totalFreeWin = freeSpins.totalWin;
                           AppG.beginFreeGame = this._countFreeGame <= this._totalFreeGame;
                           this._haveFreeOnStart = true;
                       }
                   }
                   this._winLines = packet.result.wons;
                   if (this._winLines.length) AppG.dataWins.serverData(this._winLines);
               } else {
                   this._recoverMode = false;
                   this._updateDropData(packet);
               }*/
    }

    _updateSpinData(packet) {
        super._updateSpinData(packet);
        this._multi = packet.result?.special?.multi || 1;
        this._haveWild = packet.result?.special?.feature !== "?"
    }

    _updateWinData(packet) {
        super._updateWinData(packet);
        if (AppG.isWin || this._recoverMode) {
            /*if (!AppG.isPLayReSpins) {
                this._totalRespinWin = packet.result.total;
                AppG.isRespin = true;
                AppG.isEndRespin = true;
            }*/
        }
    }

    _array2Matrix(array) {
        if (!array) return null;
        const result = [];
        for (let i = 0; i < array.length; i++) {
            // let col = i % this._totalReel;
            let col = Math.floor(i / this._totalReel);
            if (!result[col]) result[col] = [];
            result[col].push(array[i]);
        }
        return result;
    }

    updateBonusWin() {
        // this._totalWinInSpin += this._bonusWin;
        // this._totalWinInGame += this._bonusWin;
    }

    sendSpin(buyFreeSpin = false) {
        if (this._recoverMode) this._recoverMode = false;
        return super.sendSpin(buyFreeSpin);
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
    get recoverMode() {
        return this._recoverMode;
    }

    set recoverMode(value) {
        this._recoverMode = value;
    }

    get multi() {
        return this._multi;
    }

    get haveWild() {
        return this._haveWild;
    }
}

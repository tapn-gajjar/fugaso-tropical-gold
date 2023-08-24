import {AppG} from "../../../casino/AppG";
import {WinEffectBase} from "../../../casino/display/WinEffectBase";
import {SymbolEffect} from "./SymbolEffect";

export class WinEffect extends WinEffectBase {
    constructor(symbList) {
        super(symbList);

        // this._textLayer = OMY.Omy.add.container(this);
        // this._textLayer.interactChild = false;
        // this._textLayer.autoReviveChildren = false;
        this._pool = new OMY.SimpleCache(SymbolEffect, 3);
        this._sHeight = AppG.gameConst.symbolHeight * .5;
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    /** @private */
    updateGameSize() {
        // if (!this._active) return;
        // super.updateGameSize();
    }

    show() {
        if (this._active) return;
        super.show();
        // this._textLayer.revive();
    }

    hide() {
        if (!this._active) return;
        /*while (this._textLayer.children.length) {
            let child = this._textLayer.children[0];
            OMY.Omy.remove.tween(child);
            child.destroy();
        }*/

        super.hide();
    }

    clearEffect() {
        super.clearEffect();
        while (this._animLayerActive.children.length) {
            this._pool.set(this._animLayerActive.removeChildAt(0));
        }
    }

    showWinSymbol(winsList, isSkiped = false, isLoop = false) {
        super.showWinSymbol(winsList, isSkiped, isLoop);
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _normalSymbol(winsList) {
        let actor;
        let symbol;
        let reelId, symbolId;
        let symbolChar;

        /**
         * @type {WinSymbolD}
         */
        let winSymbolData = null;

        for (let i = 0; i < winsList.length; i++) {
            winSymbolData = winsList[i];
            if (!winSymbolData) continue;
            reelId = winSymbolData.reelId;
            symbolId = winSymbolData.symbolId;
            symbolChar = winSymbolData.winSymbol;

            if (this._actorList[AppG.convertID(reelId, symbolId)]) continue;

            symbol = this._reelSymbList[reelId][symbolId];

            if (this._gdConf[symbolChar]) {
                let point = this._animLayerActive.toLocal(symbol.getGlobalPosition());
                actor = this._pool.get();
                actor.x = point.x;
                actor.y = point.y;
                actor.userData = symbol;
                this._actorList[AppG.convertID(reelId, symbolId)] = actor;
                this._animLayerActive.addChild(actor);
                actor.showSymbol(winSymbolData, i, this._isSkiped, this._isLoop);
                actor.setScale(symbol.scale.x, symbol.scale.y);
                actor.skew.x = symbol.skew.x;
            }
        }

        actor = null;
        winsList = null;
        winSymbolData = null;
        symbol = null;
    }

    /**
     * @param {SymbolEffect}symbolEffect
     * @private
     */
    _showWinValue(symbolEffect) {
        const winData = symbolEffect.winData;
        const credit = winData.credit;
        const multiValue = winData.multi;
        const winWithMulti = multiValue > 1;
        if (credit) {
            const tValue = OMY.Omy.add.textJson(this._textLayer, this._gdConf["t_value"]);
            tValue.sX = tValue.x = symbolEffect.x;
            tValue.sY = tValue.y = symbolEffect.y;
            if (winWithMulti) {
                /** @type {OMY.OTextBitmap} */
                tValue.tMulti = OMY.Omy.add.textJson(tValue, this._gdConf["t_multi"]);
                tValue.tMulti.text = "x" + String(multiValue);
                tValue.text = OMY.OMath.getCashString(credit / multiValue);
                tValue.fullWinCredit = credit;
                tValue.splitInsideText = tValue.tMulti;
                this._animateWithMulti(tValue);
            } else {
                tValue.text = OMY.OMath.getCashString(credit);
                this._animate(tValue);
            }
            if (AppG.isScreenPortrait) {
                let point = tValue.getGlobalPosition();
                let r = tValue.getLocalBounds();
                if ((point.x - r.width * 0.5) < 0) {
                    tValue.x += Math.abs(point.x - r.width * 0.5) + 15;
                } else if (tValue.tMulti) {
                    let r2 = tValue.tMulti.getLocalBounds();
                    if ((point.x + r.width * 0.5 + r2.width) > OMY.Omy.WIDTH)
                        tValue.x -= 15 + Math.abs(OMY.Omy.WIDTH - (point.x + r.width * 0.5 + r2.width));
                } else if ((point.x + r.width * 0.5) > OMY.Omy.WIDTH) {
                    tValue.x -= 15 + Math.abs(OMY.Omy.WIDTH - (point.x + r.width * 0.5));
                }
            }
        }
    }

    /**     * @private
     * @param {OMY.OTextBitmap}tValue
     * */
    _animate(tValue) {
        tValue.scale.set(.05);
        tValue.y = tValue.sY + this._sHeight;
        tValue.alpha = 1;
        const conf = this._gdConf["normal_win"];

        OMY.Omy.add.tween(tValue, {
            scaleX: 1.0, scaleY: 1.0,
            ease: "back.out(3)",
        }, conf["time_scale"]);
        OMY.Omy.add.tween(tValue, {
            y: tValue.sY,
        }, conf["time_move_1"]);
        OMY.Omy.add.tween(tValue, {
            y: tValue.sY - this._sHeight,
            delay: conf["time_move_2_delay"],
        }, conf["time_move_2"]);
        OMY.Omy.add.tween(tValue, {
            alpha: 0.0,
            delay: conf["time_alpha_delay"],
        }, conf["time_alpha"]);
    }

    /**     * @private
     * @param {OMY.OTextBitmap}tValue
     * */
    _animateWithMulti(tValue) {
        const conf = this._gdConf["multi_win"];
        tValue.tMulti.alpha = 0;
        tValue.tMulti.scale.set(conf["multi_start_scale"]);
        OMY.Omy.add.tween(tValue.tMulti, {
            scaleX: 1.0, scaleY: 1.0, alpha: 1.0,
            delay: conf["time_delay_multi"],
        }, conf["time_multi_show"]);
        OMY.Omy.add.tween(tValue.tMulti, {
            alpha: 0.0,
            delay: conf["time_delay_multi"] + conf["multi_delay_on_screen"],
            onCompleteParams: [tValue]
        }, conf["time_multi_change"], this._updateWinData.bind(this));

        tValue.scale.set(.05);
        tValue.y = tValue.sY + this._sHeight;
        tValue.alpha = 1;

        OMY.Omy.add.tween(tValue, {
            scaleX: 1.0, scaleY: 1.0,
            ease: "back.out(3)",
        }, conf["time_scale"]);
        OMY.Omy.add.tween(tValue, {
            y: tValue.sY,
        }, conf["time_move_1"]);
        OMY.Omy.add.tween(tValue, {
            y: tValue.sY - this._sHeight,
            delay: conf["time_move_2_delay"],
        }, conf["time_move_2"]);
        OMY.Omy.add.tween(tValue, {
            alpha: 0.0,
            delay: conf["time_alpha_delay"],
        }, conf["time_alpha"]);

        OMY.Omy.add.tween(tValue, {
            alpha: 0.0,
            delay: conf["time_delay_multi"] + conf["multi_delay_on_screen"],
        }, conf["time_multi_change"]);
        OMY.Omy.add.tween(tValue, {
            alpha: 1.0,
            delay: conf["time_delay_multi"] + conf["multi_delay_on_screen"] + conf["time_multi_change"],
        }, conf["time_multi_change"]);
    }

    /**     * @private     */
    _updateWinData(tValue) {
        tValue.text = OMY.OMath.getCashString(tValue.fullWinCredit);
    }

    /**     * @public     */
    _debugAnimSymbols(needSymbol = "all") {
        // this.updateGameSize();
        let symbol;
        let actor;
        let symbolChar;

        for (let i = 0; i < this._reelSymbList.length; i++) {
            for (let j = 0; j < this._reelSymbList[i].length; j++) {
                symbol = this._reelSymbList[i][j];
                symbolChar = symbol.symbolName;

                if ((needSymbol === "all" || String(needSymbol) === symbolChar) &&
                    this._gdConf[symbolChar]) {
                    OMY.Omy.info('win effect:', symbolChar);
                    let point = this._animLayerActive.toLocal(symbol.getGlobalPosition());
                    actor = OMY.Omy.add.actorJson(this._animLayerActive, this._gdConf[symbolChar]);
                    actor.x += point.x;
                    actor.y += point.y;
                    actor.gotoAndPlay(0, true);
                    actor.userData = symbol;
                    if (this._gdConf["frame"]) {
                        actor = OMY.Omy.add.actorJson(this._animLayerActive, this._gdConf["frame"]);
                        actor.x += point.x;
                        actor.y += point.y;
                        actor.gotoAndPlay(0, true);
                        actor.userData = symbol;
                    }
                } else {
                    console.error("not exists", symbolChar, needSymbol);
                }
            }
        }
    }
}

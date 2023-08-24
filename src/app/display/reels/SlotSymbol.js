import {SlotSymbolBase} from "../../../casino/display/reels/SlotSymbolBase";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";

export class SlotSymbol extends SlotSymbolBase {
    constructor(reelIndex, reelParent, symbolIndex) {
        super(reelIndex, reelParent, symbolIndex);
        this.blockSymbName = this._gdConf["blockSymbName"];
        this.blockAlpha = this._gdConf["block_alpha"];
        this._checkSymbolPos = false;
        this.isUpdate = true;
        AppG.emit.on(GameConstStatic.REEL_WIN_TINT_HIDE, this._onHideReelTint, this);
        AppG.emit.on(GameConstStatic.REEL_WIN_TINT_SHOW, this._onShowReelTint, this);
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------
    _playStopEffect() {
        if (this._gdConf[this._imageName] && this._isFocus) {
            this._symbolS.visible = false;
            if (!this._effect)
                /** @type {OMY.OActorSpine} */
                this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._imageName]);
                this._effect.gotoAndPlay(0, false);
                this._effect.addComplete(this._onPlayIdle, this, true);
                if (this._imageName === "H") {
                    this._effect.setMixByName(this._effect.json["custom_a_name"], this._effect.json["idle"], 0.1);
                    if (!this._effect.parentGroup) this._effect.parentGroup = AppG.stage.symbol;
                    if (!this._changeWild) {
                        OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
                        AppG.emit.emit(GameConstStatic.E_WILD_ON_SCREEN);
                    }
                    this._changeWild = false;
                }

                if (this._imageName === "F") {
                    this._effect.setMixByName(this._effect.json["custom_a_name"], this._effect.json["idle"], 0.1);                    
                }
        }

        if (this._imageName === "H" && !this._isFocus) {                
            this.parent.setChildIndex(this, this.parent.numChildren - 1);
        }
    }

    /**     * @private     */
    _onShowReelTint() {
        if (this._imageName === "H" && this._effect) {
            this.parent.setChildIndex(this, this.parent.numChildren - 1);
            this._effect.destroy();
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._imageName]);
            this._effect.gotoAndPlay(0, true, this._effect.json["idle"]);
        }
    }

    /**     * @private     */
    _onHideReelTint() {
        if (this._imageName === "H" && this._effect) this._effect.parentGroup = AppG.stage.symbol;
    }

    recoverWild() {
        if (!this._effect) {
            this._playRecoverIdl();
            this._changeWild = false;
        }
    }

    recoverIdleEffect() {
        if (!this._effect) this._playRecoverIdl();
    }

    /**     * @private     */
    _playRecoverIdl() {
        this._symbolS.visible = false;
        if (!this._effect)
            /** @type {OMY.OActorSpine} */
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf[this._imageName]);
        this._effect.gotoAndPlay(0, true, this._effect.json["idle"]);
        if (!this._effect.parentGroup) this._effect.parentGroup = AppG.stage.symbol;
    }

    change2Wild() {
        this._changeWild = true;
        this._removeEffect();
        this.setSymbol("H");
        this._playStopEffect();
    }

    /**     * @private     */
    _onPlayIdle() {
        if (this._effect) this._effect.gotoAndPlay(0, true, this._effect.json["idle"]);
    }

    _blurState() {
        this._removeEffect();
        super._blurState();
    }

    /**     * @private     */
    _removeEffect() {
        if (this._effect) {
            this._effect.stop();
            this._effect.kill();
            this._effect = null;
            this._symbolS.visible = true;
        }
    }

    _winEffect() {
        // OMY.Omy.remove.tween(this);
        // this.alpha = 1;
        super._winEffect();
    }

    _noWinState() {
        super._noWinState();
        // this._removeEffect();
        if (this._effect) {
            this._effect.visible = false;
            this._symbolS.visible = true;
        }
        /*if (this._respinSpine && this._respinSpine.alpha === 1) {
                  OMY.Omy.remove.tween(this._respinSpine);
                  OMY.Omy.add.tween(this._respinSpine, {alpha: this.blockAlpha}, 0.3);
              }*/
        // if (this.alpha === 1) {
        //     OMY.Omy.remove.tween(this);
        //     OMY.Omy.add.tween(this, {alpha: this.blockAlpha}, 0.3);
        // }
        // this._stateName = this.blockSymbName;
    }

    _defeatState() {
        /*if (this._respinSpine) {
            OMY.Omy.remove.tween(this._respinSpine);
            if (this._respinSpine.alpha !== 1)
                OMY.Omy.add.tween(this._respinSpine, {alpha: 1}, 0.3);
        }*/
        // if (this.alpha !== 1) {
        //     OMY.Omy.remove.tween(this);
        //     OMY.Omy.add.tween(this, {alpha: 1}, 0.3);
        // }
        // this._removeEffect();
        if (this._effect) {
            this._effect.visible = true;
            this._symbolS.visible = false;
        }
        if (this._symbolBg) {
            this._symbolBg.destroy();
            this._symbolBg = null;
        }
        super._defeatState();
    }

    /*updateStateImg(st) {
        if (this._isHold || this._isRespinHold) {
            if (st === AppConst.SLOT_SYMBOL_NO_WIN)
                this._noWinState();
            if (st === AppConst.SLOT_SYMBOL_NONE || st === AppConst.SLOT_SYMBOL_WIN) {
                this._defeatState();
            }
            return;
        }
        return super.updateStateImg(st);
    }*/

    /*scatterFree(loop = false) {
        if (AppG.gameConst.isScatterSymbol(this._imageName)) {
            this._symbolS.visible = false;
            /!** @type {OMY.OActorSpine} *!/
            this._effect = OMY.Omy.add.actorJson(this, this._gdConf["scatter"]);
            if (!loop)
                this._effect.totalLoop = 2;
            this._effect.gotoAndPlay(0, true);
        }
    }*/

    /*updateImg() {
        let result = super.updateImg();
        if (this._imageName === "A" && !this._debugImg) {
            this._debugImg = OMY.Omy.add.actorJson(this, this._gdConf["wild"]);
            this._debugImg.play(true);
        }
        return result;
    }*/

    setSymbol(sName = null) {
        // sName = "A";
        this._checkSymbolPos = false;
        /* if (this._reelIndex === AppG.state.mainView.activeWaitReelIndex && !sName) {
             if (--SlotSymbol.countNotWild[this._reelIndex] <= 0) {
                 sName = "A";
                 SlotSymbol.countNotWild[this._reelIndex] = OMY.OMath.randomRangeInt(
                     AppG.gameConst.game_const["count_not_wild"][0],
                     AppG.gameConst.game_const["count_not_wild"][1]);
             }
         }*/
        let result = super.setSymbol(sName);
        if (sName && AppG.isMoveReels && this._imageName === "A") {
            // this._checkSymbolPos = true;
            AppG.emit.emit(GameConstStatic.SYMBOL_ON_REEL, this._reelIndex);
        }
        return result;
    }

//-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    update() {
        super.update();
        if (this._checkSymbolPos && this.y > 100) {
            this._checkSymbolPos = false;
            AppG.emit.emit(GameConstStatic.SYMBOL_ON_REEL, this._reelIndex);
        }
    }

    set isFocus(value) {
        this._isFocus = value;
    }

    get isFocus() {
        return super.isFocus;
    }
}

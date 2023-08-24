import {GameConstStatic} from "../../../GameConstStatic";
import {AppG} from "../../../../casino/AppG";
import {WindowsBase} from "../../../../casino/gui/WindowsBase";
import {AppConst} from "../../../../casino/AppConst";

export class FreeBuyWindow extends WindowsBase {
    constructor() {
        super();
        this._wName = AppConst.W_BUY_FREE;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDFreeBuy");
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        this._isOpen = false;
        this._isEditMode = this._gdConf["debug"] || this._gdConf["show_debug"];
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);

        this._gdConf["debug"] && OMY.Omy.add.regDebugMode(this);
        this._isEditMode && OMY.Omy.add.timer(0.5, this._showDebug, this);
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    _updateGameSize() {
        if (!this._isOpen) return;
        AppG.updateGameSize(this);
        if (this._bonusTint) {
            this._bonusTint.x = -this.x * (1 / this.scale.x);
            this._bonusTint.y = -this.y * (1 / this.scale.y);
            this._bonusTint.width = OMY.Omy.WIDTH * (1 / this.scale.x);
            this._bonusTint.height = OMY.Omy.HEIGHT * (1 / this.scale.y);
        }
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);

        if (!this._isOpen)
            this._createGraphic();

        OMY.Omy.loc.addUpdate(this._updateLoc, this);
        this._updateLoc();

        this._updateGameSize();
    }

    _createGraphic() {
        OMY.Omy.add.createEntities(this, this._gdConf);
        this._isOpen = true;

        this._bonusTint = this.getChildByName("r_bonus_tint");

        /** @type {OMY.OActorSpine} */
        this._windowBg = this.getChildByName("s_free_bg");
        this._windowBg.renderable = false;
        /** @type {OMY.OSprite} */
        this._head = this._windowBg.getSpineChildByName("Congratulation");
        this._locTexture = this._gdConf["locTexture"];
        if (this._bonusTint)
            this._bonusTint.alpha = 0;
        this._bonusTint.input = true;
        /** @type {OMY.OTextNumberBitmap} */
        this._tCost = this.getChildByName("t_cost");
        this._tCost.showCent = true;
        this._tCost.setNumbers(AppG.serverWork.costBuyFree);
        this._tCost.lastText = AppG.currency;
        this._tCost.renderable = false;

        /** @type {OMY.OTextBitmap} */
        this.tText1 = this.getChildByName("t_1");
        this.tText1.renderable = false;

        /** @type {OMY.OButton} */
        this._bYes = this.getChildByName("b_yes");
        this._bYes.visible = false;
        this._bYes.externalMethod(this._onUpYesHandler.bind(this));
        /** @type {OMY.OButton} */
        this._bNo = this.getChildByName("b_no");
        this._bNo.visible = false;
        this._bNo.externalMethod(this._onUpNoHandler.bind(this));
    }

    kill(onComplete = null) {
        OMY.Omy.loc.removeUpdate(this._updateLoc, this);

        if (this._isOpen)
            this._clearGraphic();

        super.kill(onComplete);
        this.callAll("destroy");
    }

    _clearGraphic() {
        this._windowBg = null;
        this._locTexture = null;
        this._tCost = null;
        this.tText1 = null;
        this._head = null;
        this._isOpen = false;
        this._bonusTint = null;
        this._bYes = null;
        this._bNo = null;
    }

//-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------

    _updateLoc() {
        let localMask;
        for (let locTextureKey in this._locTexture) {
            if (locTextureKey.indexOf(OMY.Omy.language) > -1) {
                localMask = this._locTexture[locTextureKey];
                break;
            }
        }
        if (this._head)
            this._head.texture = OMY.Omy.assets.getTexture(localMask);
    }

    _onRevive() {
        super._onRevive();
        this._needToBuyFree = false;
        if (this._bonusTint)
            OMY.Omy.add.tween(this._bonusTint, {
                alpha: this._bonusTint.json["alpha"],
            }, this._bonusTint.json["time_tween"]);
        this._startShowMess();
    }

    /**     * @private     */
    _startShowMess() {
        OMY.Omy.sound.play(GameConstStatic.S_open_free_buy);
        this._windowBg.renderable = true;
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_start"]);
        this._windowBg.addComplete(this._onShowMess, this, true);
        this._updateLoc();

        this.tText1.setScale(0, 0);
        this.tText1.renderable = true;
        this._tCost.alpha = 0;
        this._tCost.renderable = true;
        OMY.Omy.add.tween(this.tText1,
            {
                scaleX: 1,
                scaleY: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
        OMY.Omy.add.tween(this._tCost,
            {
                alpha: 1,
                delay: this._gdConf["time_delay_text"]
            }, this._gdConf["time_tween_text"]);
    }

    /**     * @private     */
    _onShowMess() {
        this._windowBg.gotoAndPlay(0, true, this._windowBg.json["a_loop"]);
        this._bYes.alpha = 0;
        this._bYes.visible = true;
        this._bYes.scale.set(0.2);
        OMY.Omy.add.tween(this._bYes, {
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            ease: "bounce.out"
        }, this._gdConf["time_show_btn"]);
        this._bNo.alpha = 0;
        this._bNo.visible = true;
        this._bNo.scale.set(0.2);
        OMY.Omy.add.tween(this._bNo, {
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            ease: "bounce.out"
        }, this._gdConf["time_show_btn"]);
    }

    /**     * @private     */
    _onUpYesHandler() {
        if (AppG.isWarning) return;
        OMY.Omy.sound.play(GameConstStatic.S_free_buy);
        AppG.emit.emit(GameConstStatic.E_ON_BUY_FREE);
        this._needToBuyFree = true;
        this._startHideWindow();
    }

    /**     * @private     */
    _onUpNoHandler() {
        if (AppG.isWarning) return;
        OMY.Omy.sound.play(GameConstStatic.S_not_want_free_buy);
        this._startHideWindow();
    }

    /**     * @private     */
    _startHideWindow() {
        this._bYes.isBlock = true;
        this._bYes.alpha = 1;
        this._bYes.scale.set(1);
        this._bNo.isBlock = true;
        this._bNo.alpha = 1;
        this._bNo.scale.set(1);
        OMY.Omy.remove.tween(this._bYes);
        OMY.Omy.remove.tween(this._bNo);
        OMY.Omy.add.tween(this._bonusTint, {
            alpha: 0,
        }, this._bonusTint.json["time_hide"]);
        OMY.Omy.sound.play(GameConstStatic.S_close_free_buy);
        this._windowBg.gotoAndPlay(0, false, this._windowBg.json["a_end"]);
        this._windowBg.addComplete(this._startCloseWindow, this, true);
        OMY.Omy.add.tween(this.tText1,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
        OMY.Omy.add.tween(this._tCost,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
        OMY.Omy.add.tween(this._bNo,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
        OMY.Omy.add.tween(this._bYes,
            {
                alpha: 0,
            }, this._gdConf["time_hide_text"]);
    }

    /**     * @private     */
    _startCloseWindow() {
        this._windowBg.stop();
        OMY.Omy.add.timer(0.2, this._hideWindow, this);
    }

    _hideWindow() {
        OMY.Omy.remove.tween(this.tText1);
        OMY.Omy.remove.tween(this._tCost);
        OMY.Omy.remove.tween(this._bNo);
        OMY.Omy.remove.tween(this._bYes);
        this._closeWindow();
    }

    _closeWindow() {
        this._hideMe();
        if (this._needToBuyFree)
            AppG.serverWork.sendSpin(true);
        else
            AppG.state.startNewSession();
    }

    get isOpen() {
        return this._isOpen;
    }

    get isEditMode() {
        return this._isEditMode;
    }
}

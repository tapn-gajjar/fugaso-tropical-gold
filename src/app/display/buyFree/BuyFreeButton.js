import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {GameConstStatic} from "../../GameConstStatic";

export class BuyFreeButton {
    constructor(graphic) {
        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._isBlock = false;
        this._notGoodBalance = false;

        /** @type {OMY.OTextBitmap} */
        this._t1 = this._graphic.getChildByName("t_1");
        /** @type {OMY.OTextBitmap} */
        this._t2 = this._graphic.getChildByName("t_2");
        /** @type {OMY.OTextBitmap} */
        this._t3 = this._graphic.getChildByName("t_3");
        this._t3.visible = false;

        /** @type {OMY.OTextNumberBitmap} */
        this._tCost = this._graphic.getChildByName("t_cost");
        this._tCost.showCent = true;
        this._tCost.lastText = AppG.currency;
        this._updateBet();
        /** @type {OMY.OSprite} */
        this._sPanel = this._graphic.getChildByName("s_cost_panel");

        /** @type {OMY.OContainer} */
        this.lightCanvas = this._graphic.getChildByName("c_light_canvas");

        /** @type {OMY.OActorSpine} */
        this._aLight = this.lightCanvas.getChildByName("a_light");
        this._aLight.addComplete(this._onResetLightEffect, this);
        this._aLight.alpha = 0;
        this._timerLight = OMY.Omy.add.timer(this.timeForLight, this._startPlayLight, this);

        /** @type {OMY.OGraphic} */
        this._rHint = this._graphic.getChildByName("r_input");
        this._rHint.input = true;
        this._rHint.addUp(this._onUpHandler, this, false);
        if (OMY.Omy.isDesktop) {
            this._rHint.addOver(this._onOverHandler, this, false);
            this._rHint.addOut(this._onOutHandler, this, false);
            this._rHint.addUpOutSide(this._onOutHandler, this, false);
        }

        AppG.emit.on(AppConst.APP_EMIT_ON_BET, this._updateBet, this);
        AppG.emit.on(AppConst.APP_EMIT_ON_CREDIT, this._updateBet, this);
        AppG.emit.on(GameConstStatic.E_ON_BUY_FREE, this._onBuyFree, this);

        this._btnManager = OMY.Omy.navigateBtn;
        this._btnManager.addBtn(this, this._updateState, this._updateBlocking);
        this._btnGameState = this._btnManager.state;

        this._checkBlock();
        // OMY.Omy.loc.addUpdate(this._updateText, this);
    }

    /**     * @private     */
    _onResetLightEffect() {
        OMY.Omy.add.tween(this._aLight, {alpha:0}, 0.1);
    }

    /**     * @private     */
    _startPlayLight() {
        this._timerLight?.destroy();
        OMY.Omy.add.tween(this._aLight, {alpha:1}, 0.1);
        this._aLight.gotoAndPlay(0);
        let time = this.timeForLight;
        this._timerLight = OMY.Omy.add.timer(time, this._startPlayLight, this);
    }

    /**     * @private     */
    _updateBet() {
        this._tCost.setNumbers(AppG.serverWork.costBuyFree);
        this._notGoodBalance = !AppG.serverWork.isUserHasCashForBuy;
        this._checkBlock();
    }

    /**     * @private     */
    _updateState(state) {
        this._btnGameState = state;
        this._checkBlock();
    }

    /**     * @private     */
    _updateBlocking(value) {
        this._isBlock = value;
        this._checkBlock();
    }

    /**     * @private     */
    _onBuyFree() {
        this._t3.visible = true;
        this._t3.scale.set(0);
        this._t3.alpha = 0;
        OMY.Omy.add.tween(this._t3,
            {scaleX: 1, scaleY: 1, alpha: 1, ease: "bounce.out"},
            this._gdConf["time_tween"]);

        OMY.Omy.add.tween(this._t1,
            {alpha: 0},
            this._gdConf["time_tween"] * .6);
        OMY.Omy.add.tween(this._t2,
            {alpha: 0},
            this._gdConf["time_tween"] * .6);
        OMY.Omy.add.tween(this._tCost,
            {alpha: 0},
            this._gdConf["time_tween"] * .6);
        OMY.Omy.add.tween(this._sPanel,
            {scaleX: 0},
            this._gdConf["time_tween"] * .6);
    }

    /** @public */
    startFree() {
        this._timerLight.destroy();
        this._aLight.stop();
        this.lightCanvas.removeChild(this._aLight);
        this._graphic.kill();
    }

    /** @public */
    endFree() {
        this._graphic.revive();
        this._t3.visible = false;
        this._t1.alpha = 1;
        this._t2.alpha = 1;
        this._tCost.alpha = 1;
        this._sPanel.scaleX = 1;
        this._checkBlock();
        this.lightCanvas.addChild(this._aLight);
        this._aLight.gotoAndStop(0);
        this._timerLight = OMY.Omy.add.timer(this.timeForLight, this._startPlayLight, this);
    }

    /**     * @private     */
    _onUpHandler() {
        if (this.isBlock) return;
        if (!OMY.Omy.isDesktop) {
            OMY.Omy.add.tween(this._graphic,
                {
                    scaleX: this._graphic.scaleX - 0.02,
                    scaleY: this._graphic.scaleY - 0.02,
                    yoyo: true,
                    repeat: 1
                },
                0.2);
        }
        OMY.Omy.sound.play(GameConstStatic.S_free_buy);
        OMY.Omy.viewManager.showWindow(AppConst.W_BUY_FREE, false,
            OMY.Omy.viewManager.gameUI.getWindowLayer());
    }

    /**     * @private     */
    _onOverHandler() {
        if (this.isBlock) return;
        OMY.Omy.add.tween(this._graphic.scale, {x: 0.99, y: 0.99}, 0.2);
    }

    /**     * @private     */
    _onOutHandler() {
        OMY.Omy.add.tween(this._graphic.scale, {x: 1.0, y: 1.0}, 0.2);
    }

    /**     * @private     */
    _checkBlock() {
        if (this.isBlock) {
            this._graphic.alpha = this._gdConf["block_level"];
        } else {
            this._graphic.alpha = 1;
        }
    }

    get timeForLight() {
        return OMY.OMath.randomRangeNumber(this._aLight.json["time"][0], this._aLight.json["time"][1]);
    }

    get isBlock() {
        return this._isBlock || this._notGoodBalance || this._btnGameState !== AppConst.C_NONE
            || AppG.isRichSpin;
    }
}

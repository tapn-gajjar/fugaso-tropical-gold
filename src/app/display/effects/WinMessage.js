import {WinMessageBase} from "../../../casino/display/win/WinMessageBase";
import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

let _incAnim = false;

export class WinMessage extends WinMessageBase {
    constructor(graphic) {
        super(graphic);

        this._isPort = AppG.isScreenPortrait;
        this._timeForLineValue = AppG.gameConst.getData("timeShowWinLine");

        /** @type {OMY.ORevoltParticleEmitter} */
        this._coins = graphic.getChildByName("re_coins_top");
        this._coins.kill();
        // /** @type {OMY.OGraphic} */
        // this._tint = graphic.getChildByName("r_tint");
        // this._tint.visible = false;
        // this._tint.interactive = true;
        this._activeSound = null;

        /** @type {OMY.OContainer} */
        this._spineCanvas = graphic.getChildByName("c_spine");

        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._txtWin.lastText = ",";

        // AppG.emit.on(AppConst.APP_SHOW_BONUS_WIN, this._showBonusWinMessage, this);
        // OMY.Omy.addUpdater(this._update, this);
        this._txtWin.onStepInc = this._update.bind(this);
        this._winCoef = 0;
        this._tweenTxtCoef = this._gdConf["coef_for_up_txt"];
        this._txtScaleLvl = this._gdConf["scale_txt_lvl"];

        if (this._gdConf.hasOwnProperty("active_debug")) {
            this._debugMessage = true;
            const debConst = this._gdConf["active_debug"].split(":");
            AppG.winCredit = debConst[1];
            AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
            AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
            switch (debConst[0]) {
                case this.C_TYPE_BIG: {
                    OMY.Omy.add.timer(0.6, this._showBigWinMessage, this);
                    break;
                }
                case this.C_TYPE_EPIC: {
                    OMY.Omy.add.timer(0.6, this._showEpicWinMessage, this);
                    break;
                }
                case this.C_TYPE_MEGA: {
                    OMY.Omy.add.timer(0.6, this._showMegaWinMessage, this);
                    break;
                }
                case this.C_TYPE_SUPER: {
                    OMY.Omy.add.timer(0.6, this._showSuperMegaWinMessage, this);
                    break;
                }

                default: {
                    OMY.Omy.add.timer(0.6, this._showSimpleWinMessage, this);
                    break;
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //------------------------------------------------------------------------
    /**     * @private     */
    _resize() {
        if (this._coins.active) {
            this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
        }
        if (!OMY.Omy.isDesktop && ((this._isPort && !AppG.isScreenPortrait) || (!this._isPort && AppG.isScreenPortrait))) {
            this._isPort = AppG.isScreenPortrait;
            if (this._aEffect?.active) {
                this._checkSpineJson();
                const frame = this._aEffect.currentFrame;
                const loop = this._aEffect.loop;
                const animName = this._spineJson[this._aEffect.userData];
                this._aEffect.gotoAndPlay(frame, loop, animName);
            }
            if (this._moveTween) {
                this._moveTween.kill();
                this._moveTween = null;
                AppG.updateGameSize(this._txtWin);
            }
            if (this._aFly) this._aFly.gotoAndPlay(this._aFly.currentFrame, false, (this._isPort) ? this._aFly.json["port"] : this._aFly.json["land"]);
        }

        this._tint && OMY.Omy.add.timer(0.001, this._updatePosOfTint, this, 3);
    }


    /**     * @private     */
    _updatePosOfTint() {
        let scale = 1 / this._graphic.scaleX;
        this._tint.width = OMY.Omy.WIDTH * scale;
        this._tint.height = OMY.Omy.HEIGHT * scale;
        this._tint.x = -this._graphic.x * scale;
        this._tint.y = -this._graphic.y * scale;
    }

    _showBonusWinMessage() {
        this._showWinMessage("bonus");
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        this._resize();
        super._showWinMessage(winSize);
        this._skiping = false;
        this._txtWin.visible = true;

        this._txtWin.alpha = 0;
        this._txtWin.setNumbers(0, false);
        OMY.Omy.remove.tween(this._txtWin);
        // this._tint.visible = false;
        AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.incTimeTake);
        _incAnim = false;
        this._isCheckLimits = false;
        this._checkPartCount = 1;
        this._maxWinType = winSize;
        this._jsonTxt = (AppG.isBonusGame) ? this._gdConf["pos"]["bonus"] : this._gdConf["pos"]["win"];
        let pos;

        let winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        this._onCheckTxtSize = false;
        this._activeSound = null;

        this._spinMulti = (this._debugMessage && this._gdConf["test_multi"] > 1) ? this._gdConf["test_multi"] : AppG.serverWork.multi;
        this._normalWin = (this._spinMulti > 1) ? AppG.winCredit / this._spinMulti : 0;
        this._checkMultiEffect = false;

        this.fly_bg = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["fly_bg"]);
        if (!OMY.Omy.isDesktop) AppG.updateGameSize(this.fly_bg);
        this.fly_bg?.gotoAndPlay(0, true, this.fly_bg.json["idle"]);

        switch (this._maxWinType) {
            case this.C_TYPE_BIG: {
                // this._tint.visible = true;
                // this._tint.alpha = 0;
                pos = this._jsonTxt["txt"]["big"];
                this._currentWinLvl = this.C_TYPE_BIG;
                this._playEndSound = false;

                OMY.Omy.sound.play(GameConstStatic.S_take_take, true);
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);

                this._txtWin.scale.set(1);
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                }, this._gdConf["time_show_txt"], null);

                if (this._normalWin > 0) {
                    this._checkMultiEffect = true;
                    this._normalWin = (this._normalWin / AppG.serverWork.betForLimit) * .7;
                }
                this._onCheckTxtSize = true;
                this._tweenFontSize = OMY.Omy.add.tween(this._txtWin, {fontSize: this._txtScaleLvl}, AppG.incTimeTake * 3);
                this._screenDelay = this._gdConf["screen_delay"];
                break;
            }
            case this.C_TYPE_SUPER:
            case this.C_TYPE_MEGA:
            case this.C_TYPE_EPIC: {
                pos = this._jsonTxt["txt"]["epic"];
                this._currentWinLvl = this.C_TYPE_BIG;
                this._playEndSound = true;
                switch (this._maxWinType) {
                    case this.C_TYPE_EPIC: {
                        this._checkPartCount = 2;
                        break;
                    }
                    case this.C_TYPE_MEGA: {
                        this._checkPartCount = 3;
                        break;
                    }
                    case this.C_TYPE_SUPER: {
                        this._checkPartCount = 4;
                        break;
                    }
                }
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_SHOW);
                this._screenDelay = this._gdConf["screen_delay"];
                // AppG.showWinTime += this._gdConf["bonus_delay"];
                this._isCheckLimits = true;
                this._needCoefLimit = (1 / this._checkPartCount) * AppG.winCoef;
                if (this._normalWin > 0) {
                    this._normalWin = (this._normalWin / AppG.serverWork.betForLimit) * .9;
                    if (this._normalWin >= this._needCoefLimit * .5) this._normalWin = this._needCoefLimit * .5;
                    this._checkMultiEffect = true;
                }
                OMY.Omy.sound.play(GameConstStatic.S_take_take, true);
                this._txtWin.incSecond = AppG.incTimeTake;
                this._txtWin.setNumbers(AppG.winCredit, true);
                this._txtWin.scale.set(1);
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                    // ease: "back.out(1.7)",
                }, this._gdConf["time_show_txt"], null);
                this._onCheckTxtSize = true;
                this._tweenFontSize = OMY.Omy.add.tween(this._txtWin,
                    {fontSize: this._txtScaleLvl}, AppG.incTimeTake);
                break;
            }

            default: {
                pos = this._jsonTxt["txt"]["none"];
                this._currentWinLvl = this.C_TYPE_WIN;
                this._playEndSound = false;

                const winMultiplier = AppG.serverWork.winMultiplier || 1;
                const winValue = this._normalWin * winMultiplier;
                const incSec = AppG.getTimeByWinValue(winValue, AppG.gameConst.getData("gui_inc_conf"));

                if (this._normalWin > 0) {
                    this._txtWin.setNumbers(this._normalWin, false);
                    OMY.Omy.add.timer(incSec, () => {
                        this._createFlyEffect();
                    }, this);

                } else {
                    this._txtWin.setNumbers(AppG.winCredit, false);
                    this._screenDelay = 0;
                }

                this._txtWin.scale.set(1);
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 1,
                }, this._gdConf["time_show_txt"], null);


                OMY.Omy.add.timer(incSec + 0.7 , () => {
                    // this._txtWin PopEffect at the end
                    OMY.Omy.add.tween(this._txtWin, {
                        scaleX: 1.2,
                        scaleY: 1.2,
                        repeat: 1,
                        yoyo: true
                    }, 0.2);
                }, this);
            }
        }

        // this._tint.visible && OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);

        this._timeHideMessage = this._gdConf["time_hide_mess"];
        if (!this._debugMessage)
            this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        OMY.OMath.objectCopy(this._txtWin.json, pos);
        this._txtWin.fontSize = pos["fontSize"];
        this._txtWin.x = pos.x;
        this._txtWin.y = pos.y;
        this._startHide = false;
        _incAnim = true;

        AppG.updateGameSize(this._graphic);
        this._timerForceSkip?.destroy();
        /*if (AppG.skippedWin &&
            (this._maxWinType === this.C_TYPE_BIG || this._maxWinType === this.C_TYPE_EPIC) &&
            this._timerForceSkip) {
            this._timerForceSkip.destroy();
            this._timerForceSkip = OMY.Omy.add.timer(this._gdConf["skip_big_win_time"], this._skipWinAnimations, this);
        }*/
    }

    /**     * @private     */
    _update(value) {

        if (this._isCheckLimits) {
            this._winCoef = value / AppG.serverWork.betForLimit;
            if (this._winCoef >= this._needCoefLimit) this._changeWinLimit();
        }
        if (this._onCheckTxtSize) {
            if (this._txtWin.width > this._txtWin.json.width) {
                this._tweenFontSize.kill();
                this._tweenFontSize = null;
                OMY.Omy.remove.tween(this._txtWin);
                this._onCheckTxtSize = false;
            }
        }

        // If Big Win with multiplier
        if (this._winCoef && this._needCoefLimit){
            if (this._checkMultiEffect) {
                const winCoef = value / AppG.serverWork.betForLimit;
                if (winCoef >= this._normalWin){
                    this._createFlyEffect(true);
                }
            }
        }else{
            // If Medium Win with multiplier
            this._spinMulti = (this._debugMessage && this._gdConf["test_multi"] > 1) ? this._gdConf["test_multi"] : AppG.serverWork.multi;
            let normalWinTemp = (this._spinMulti > 1) ? AppG.winCredit / this._spinMulti : 0;
            if (normalWinTemp > 0) {
                this._txtWin.setNumbers(normalWinTemp, false);
                const winMultiplier = AppG.serverWork.winMultiplier || 1;
                const winValue = normalWinTemp * winMultiplier;
                const incSec = AppG.getTimeByWinValue(winValue, AppG.gameConst.getData("gui_inc_conf"));
                OMY.Omy.add.timer(incSec, () => {
                    if (this._checkMultiEffect) {
                        this._createFlyEffect();
                    }
                }, this);
            }
        }
    }

    /**     * @private     */
    _changeWinLimit() {
        let pos = null;
        switch (this._currentWinLvl) {
            case this.C_TYPE_BIG: {
                this._onCheckTxtSize = false;
                if (this._maxWinType === this.C_TYPE_EPIC) {
                    this._isCheckLimits = false;
                    this._needCoefLimit = Number.MAX_VALUE;
                } else {
                    this._needCoefLimit = (2 / this._checkPartCount) * AppG.winCoef;
                }
                this._currentWinLvl = this.C_TYPE_EPIC;
                OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                OMY.Omy.sound.play(GameConstStatic.S_pop_up_poster, false);
                this._activeSound = GameConstStatic.S_big_win_show;

                // this._tint.visible = true;
                // this._tint.alpha = 0;
                // this._tint.visible && OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);

                this._onShowBigLabel();
                this._tweenFontSize?.kill();
                pos = this._jsonTxt["txt"]["epic"];
                this._onMoveText = false;
                this._tweenFontSize = OMY.Omy.add.tween(this._txtWin,
                    {fontSize: pos["new_pos"]["fontSize"]}, pos["m_time"]);

                if (this.fly_bg) {
                    this.fly_bg?.destroy();
                    this.fly_bg = null;
                }

                this._numberBg = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["number_bg"]);
                if (!OMY.Omy.isDesktop) AppG.updateGameSize(this._numberBg);
                this._numberBg.alpha = 0;
                this._numberBg.gotoAndPlay(0, true);

                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_BIG);
                break;
            }
            case this.C_TYPE_EPIC: {
                this._onCheckTxtSize = false;
                this._tweenFontSize = null;
                if (this._maxWinType === this.C_TYPE_MEGA) {
                    this._isCheckLimits = false;
                    this._needCoefLimit = Number.MAX_VALUE;
                } else {
                    this._needCoefLimit = (3 / this._checkPartCount) * AppG.winCoef;
                }
                this._currentWinLvl = this.C_TYPE_MEGA;
                OMY.Omy.sound.play(GameConstStatic.S_mega_win_show, false);
                OMY.Omy.sound.stop(GameConstStatic.S_big_win_show);
                this._activeSound = GameConstStatic.S_mega_win_show;
                OMY.Omy.sound.play(GameConstStatic.S_pop_up_poster, false);

                pos = this._jsonTxt["txt"]["mega"];
                // OMY.OMath.objectCopy(this._txtWin.json, pos);
                /*OMY.Omy.add.tween(this._txtWin, {
                    x: pos["x"],
                    y: pos["y"],
                    ease: "none"
                }, pos["m_time"]);*/

                this._aEffect.removeComplete(null, null);
                this._aEffect.userData = "show_mega";
                this._aEffect.gotoAndPlay(0, false, this._spineJson["show_mega"]);
                this._aEffect.x = this._jsonTxt["label"]["mega"]["x"];
                this._aEffect.y = this._jsonTxt["label"]["mega"]["y"];
                this._aEffect.addComplete(() => {
                    this._aEffect.userData = "loop_mega";
                    this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_mega"]);
                }, this, true);
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_MEGA);
                break;
            }
            case this.C_TYPE_MEGA: {
                this._isCheckLimits = false;
                this._needCoefLimit = Number.MAX_VALUE;
                this._currentWinLvl = this.C_TYPE_SUPER;
                OMY.Omy.sound.play(GameConstStatic.S_epic_win_show, false);
                OMY.Omy.sound.stop(GameConstStatic.S_mega_win_show);
                this._activeSound = GameConstStatic.S_epic_win_show;
                OMY.Omy.sound.play(GameConstStatic.S_pop_up_poster, false);

                this._coins.revive();
                this._coins.particle.settings.floorY = OMY.Omy.HEIGHT * 1.5;
                this._coins.addCompleted(this._needClearCoin, this, false);
                this._coins.start();

                this._aEffect.removeComplete(null, null);
                this._aEffect.userData = "show_epic";
                this._aEffect.gotoAndPlay(0, false, this._spineJson["show_epic"]);
                this._aEffect.x = this._jsonTxt["label"]["epic"]["x"];
                this._aEffect.y = this._jsonTxt["label"]["epic"]["y"];
                this._aEffect.addComplete(() => {
                    this._aEffect.userData = "loop_epic";
                    this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_epic"]);
                }, this, true);
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_EPIC);
                break;
            }
        }
    }

    /**     * @private     */
    _onMoveWinValue() {
        if (this._onMoveText) return;
        this._onMoveText = true;
        const pos = this._jsonTxt["txt"]["epic"];
        OMY.OMath.objectCopy(this._txtWin.json, pos["new_pos"]);
        this._moveTween = OMY.Omy.add.tween(this._txtWin, {
            x: pos["new_pos"][(!OMY.Omy.isDesktop && this._isPort) ? "v_x" : "x"],
            y: pos["new_pos"][(!OMY.Omy.isDesktop && this._isPort) ? "v_y" : "y"],
            ease: "none"
        }, pos["m_time"]);
        OMY.Omy.add.tween(this._numberBg, {alpha: 1, delay: pos["m_time"]}, pos["m_time"] * .5);
    }

    /**     * @private     */
    _onShowBigLabel() {
        /** @type {OMY.OActorSpine} */
        this._aEffect = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["spine"]);
        this._checkSpineJson();
        this._aEffect.userData = "show_big";
        this._aEffect.gotoAndPlay(0, false, this._spineJson["show_big"]);
        this._aEffect.x = this._jsonTxt["label"]["big"]["x"];
        this._aEffect.y = this._jsonTxt["label"]["big"]["y"];
        this._aEffect.speed = 1.2;
        this._aEffect.addSpineEvent(this._onMoveWinValue, this, false);
        this._aEffect.addComplete(() => {
            this._aEffect.userData = "loop_big";
            this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_big"]);
        }, this, true);
    }

    /**     * @private     */
    _checkSpineJson() {
        if (!this._aEffect) return;
        this._spineJson = (OMY.Omy.isDesktop) ? this._aEffect.json : ((this._isPort) ? this._aEffect.json.port : this._aEffect.json.land);
    }

    /**     * @private     */
    _createFlyEffect(bigwin = false) {

        if(!this._aFly){
            this.FlyEffect = true;
            //_aFly animation
            OMY.Omy.sound.play(GameConstStatic.S_multi_move);
            /** @type {OMY.OActorSpine} */
            this._aFly = OMY.Omy.add.actorJson(this._graphic, this._gdConf["fly"]);
            AppG.updateGameSize(this._aFly);

            this._aFly.gotoAndPlay(0, false, (!OMY.Omy.isDesktop && this._isPort) ? this._aFly.json["port"] : this._aFly.json["land"]);
            this._aFly?.addSpineEvent(this._updateToNormalWin, this, false);
            this._aFly?.addComplete(this._onDestroyFly, this, false);

            this.fly_bg_coin = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["fly_bg"]);
            AppG.updateGameSize(this.fly_bg_coin);

            this._screenDelay = 1;

            OMY.Omy.add.timer(0.4 , () => {
                //fly_bg Coin animation
                this.fly_bg_coin?.gotoAndPlay(0, false);
            }, this);

            this._aFly.userData = bigwin;
            this._checkMultiEffect = false;
            this.FlyEffect = false;

        }

    }

    /**     * @private     */
    _updateToNormalWin() {
        if(this._aFly){
            if (!this._aFly?.userData) {
                this._txtWin?.setNumbers(AppG.winCredit, false);
                this._txtWin?._findNeedSize();
            }
        }

    }

    /**     * @private     */
    _onDestroyFly() {
        if(this._aFly){
            this._aFly?.stop();
            OMY.Omy.game.addNextTickUpdate(this._aFly?.destroy, this._aFly);
            this._aFly = null;
        }
    }

    /**     * @private     */
    _onDestroyFlyBg(){
        if (this.fly_bg) {
            this.fly_bg?.destroy();
            this.fly_bg = null;
        }
        if(this.fly_bg_coin){
            this.fly_bg_coin?.stop();
            OMY.Omy.game.addNextTickUpdate(this.fly_bg_coin?.destroy, this.fly_bg_coin);
            this.fly_bg_coin = null;
        }

    }

    _onCompleteIncWin() {
        this._isCheckLimits = false;
        if (_incAnim) {
            _incAnim = false;

            if(this.FlyEffect){
                return;
            }
            OMY.Omy.sound.stop(GameConstStatic.S_take_take);
            if (OMY.Omy.sound.isSoundPlay(this._activeSound)) OMY.Omy.sound.stop(this._activeSound);
            if (this._playEndSound)
                OMY.Omy.sound.play(GameConstStatic.S_big_win_END);

            OMY.Omy.sound.play(GameConstStatic.S_cash);

            OMY.Omy.remove.tween(this._txtWin);
            this._tweenFontSize?.kill();
            this._tweenFontSize = null;

            OMY.Omy.add.tween(this._txtWin, {
                scaleX: 1.2,
                scaleY: 1.2,
                repeat: 1,
                yoyo: true
            }, 0.2);

            this._txtWin.stopInctAnimation();
            this._txtWin.setNumbers(this._txtWin.value);
            AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
            super._onCompleteIncWin();
        }
    }

    /**     * @private     */
    _skipWinAnimations() {
        if (!this._graphic.visible) return;
        if (this._skiping) return;
        // if (this._aFly) {
        //     this._updateToNormalWin();
        //     this._onDestroyFly();
        //     this._onDestroyFlyBg();
        // }

        if(this.FlyEffect){
            return;
        }
        this._onCompleteIncWin();

        this._lineTimer?.destroy();
        this._skiping = true;
        let forceEnd = false;
        // this._currentWinLvl = this._maxWinType;
        if (this._moveTween) {
            this._moveTween.kill();
            this._moveTween = null;
            AppG.updateGameSize(this._txtWin);
        }

        if (this._maxWinType !== this._currentWinLvl) {

            if (this.fly_bg) {
                this.fly_bg?.destroy();
                this.fly_bg = null;
            }

            let pos = this._jsonTxt["txt"]["epic"];
            this._currentWinLvl = this._maxWinType;
            forceEnd = true;
            this._onCheckTxtSize = false;
            if (!this._aEffect) {
                /** @type {OMY.OActorSpine} */
                this._aEffect = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["spine"]);
                this._checkSpineJson();
                this._aEffect.x = this._jsonTxt["label"]["big"]["x"];
                this._aEffect.y = this._jsonTxt["label"]["big"]["y"];
            }
            this._aEffect.speed = 1;
            OMY.OMath.objectCopy(this._txtWin.json, pos["new_pos"]);
            this._txtWin.setXY(
                pos["new_pos"][(!OMY.Omy.isDesktop && this._isPort) ? "v_x" : "x"],
                pos["new_pos"][(!OMY.Omy.isDesktop && this._isPort) ? "v_y" : "y"]
            );
            this._txtWin.fontSize = pos["new_pos"]["fontSize"];
            if (!this._numberBg) {
                this._numberBg = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["number_bg"]);
                if (!OMY.Omy.isDesktop) AppG.updateGameSize(this._numberBg);
                this._numberBg.gotoAndPlay(0, true);
            }
            OMY.Omy.sound.play(GameConstStatic.S_pop_up_poster, false);
            OMY.Omy.sound.stop(this._activeSound);

            switch (this._currentWinLvl) {
                case this.C_TYPE_EPIC: {
                    OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                    this._activeSound = GameConstStatic.S_big_win_show;
                    this._aEffect.userData = "loop_big";
                    this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_big"]);
                    break;
                }
                case this.C_TYPE_MEGA: {
                    OMY.Omy.sound.play(GameConstStatic.S_mega_win_show, false);
                    this._activeSound = GameConstStatic.S_mega_win_show;
                    this._aEffect.removeComplete(null, null);
                    this._aEffect.userData = "loop_mega";
                    this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_mega"]);
                    AppG.emit.emit(GameConstStatic.WIN_MESSAGE_MEGA);
                    break;
                }
                case this.C_TYPE_SUPER: {
                    OMY.Omy.sound.play(GameConstStatic.S_epic_win_show, false);
                    this._activeSound = GameConstStatic.S_epic_win_show;
                    this._aEffect.removeComplete(null, null);
                    this._aEffect.userData = "loop_epic";
                    this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_epic"]);
                    AppG.emit.emit(GameConstStatic.WIN_MESSAGE_EPIC);
                    break;
                }
            }
            AppG.emit.emit(GameConstStatic.WIN_MESSAGE_BIG);
        }
        this._screenDelay = this._gdConf["screen_delay"];
        if (!this._startHide) {
            // OMY.Omy.remove.tween(this._txtWin);
            this._txtWin.alpha = 1;
            // this._txtWin.scale.set(1);
            if (forceEnd) OMY.Omy.add.timer(this._gdConf["skip_bigWin_delay"], this._hideWinMessage, this);
            else this._hideWinMessage();
        }/* else {
            this._messageClear();
        }*/
    }

    /**     * @private     */
    _needClearCoin() {
        this._coins.kill();
    }

    _hideWinMessage() {

        this._onCompleteIncWin();

        this._coins.active && this._coins.stop();
        this._isCheckLimits = false;
        this._lineTimer?.destroy();
        this._startHide = true;
        // OMY.Omy.remove.tween(this._txtWin);
        this._timerHideDelay = OMY.Omy.add.timer(this._screenDelay, this._delayHideMess, this);
    }

    /**     * @private     */
    _delayHideMess() {
        this._timerHideDelay = null;
        switch (this._maxWinType) {
            case this.C_TYPE_WIN:
            case this.C_TYPE_BIG: {
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 0,
                    ease: "none",
                }, this._timeHideMessage, this._messageClear.bind(this));
                if (this._aEffect) {
                    OMY.Omy.add.tween(this._aEffect, {
                        alpha: 0,
                        ease: "none",
                    }, this._timeHideMessage);
                }
                if (this._numberBg) {
                    OMY.Omy.add.tween(this._numberBg, {
                        alpha: 0,
                        ease: "none",
                    }, this._timeHideMessage);
                }
                break;
            }

            default: {
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 0,
                    scaleX: this._gdConf["hide_scale"], scaleY: this._gdConf["hide_scale"],
                    ease: "none",
                }, this._timeHideMessage, this._messageClear.bind(this));
            }
        }
        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
        // this._tint.visible && OMY.Omy.add.tween(this._tint, {alpha: 0}, 0.3);
    }

    _messageClear() {
        if (this._activeSound) {
            OMY.Omy.sound.stop(this._activeSound);
            OMY.Omy.sound.fadeIn(GameConstStatic.S_game_bg, 1.3);
            this._activeSound = null;
        }
        this._timerHideDelay?.destroy();
        this._timerHideDelay = null;
        this._lineTimer?.destroy();
        OMY.Omy.remove.tween(this._txtWin);
        // OMY.Omy.remove.tween(this._tint);
        if (this._aEffect) {
            OMY.Omy.remove.tween(this._aEffect);
            this._aEffect.destroy();
            this._aEffect = null;
        }
        if (this._numberBg) {
            OMY.Omy.remove.tween(this._numberBg);
            this._numberBg.destroy();
            this._numberBg = null;
        }
        if (this._aFly) {
            this._aFly?.destroy();
            this._aFly = null;
        }
        if (this.fly_bg) {
            this.fly_bg?.destroy();
            this.fly_bg = null;
        }
        if (this.fly_bg_coin){
            this.fly_bg_coin?.destroy();
            this.fly_bg_coin = null;
        }
        this._moveTween = null;
        // this._tint.visible = false;
        AppG.emit.emit(AppConst.APP_STOP_WIN_PARTICLES);
        super._hideWinMessage();
        this._graphic.visible = true;
    }

    static get incAnim() {
        return _incAnim;
    }
}

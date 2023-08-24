import {GameConstStatic} from "../../GameConstStatic";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";

export class WinMessageTurbo {
    constructor(graphic) {
        this.C_TYPE_WIN = "none";
        this.C_TYPE_BIG = "big";
        this.C_TYPE_EPIC = "epic";
        this.C_TYPE_MEGA = "mega";
        this.C_TYPE_SUPER = "super";
        this._isPort = AppG.isScreenPortrait;

        /** @type {OMY.OContainer} */
        this._graphic = graphic;
        this._gdConf = this._graphic.json;
        this._graphic.visible = false;

        /** @type {OMY.OContainer} */
        this._spineCanvas = graphic.getChildByName("c_spine");
        /** @type {OMY.OActorSpine} */
        this._aEffect = null;

        AppG.emit.on(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, this._showSimpleWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN_TURBO, this._showBigWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_EPIC_WIN_TURBO, this._showEpicWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_MEGA_WIN_TURBO, this._showMegaWinMessage, this);
        AppG.emit.on(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, this._showSuperMegaWinMessage, this);

        this._activeSound = null;
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._resize, this);
        this._txtWin = this._graphic.getChildByName("t_win");
        this._txtWin.showCent = true;
        this._txtWin.lastText = ",";
        this._tweenTxtCoef = this._gdConf["coef_for_up_txt"];
        this._txtScaleLvl = this._gdConf["scale_txt_lvl"];

        if (this._gdConf.hasOwnProperty("active_turbo_debug")) {
            this._debugMessage = true;
            const debConst = this._gdConf["active_turbo_debug"].split(":");
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

    _showSimpleWinMessage() {
        this._showWinMessage(this.C_TYPE_WIN);
    }

    _showBigWinMessage() {
        this._showWinMessage(this.C_TYPE_BIG);
    }

    _showMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_MEGA);
    }

    _showSuperMegaWinMessage() {
        this._showWinMessage(this.C_TYPE_SUPER);
    }

    _showEpicWinMessage() {
        this._showWinMessage(this.C_TYPE_EPIC);
    }

    /**     * @private     */
    _resize() {
        if (!OMY.Omy.isDesktop && ((this._isPort && !AppG.isScreenPortrait) || (!this._isPort && AppG.isScreenPortrait))) {
            this._isPort = AppG.isScreenPortrait;
            if (this._aEffect?.active) {
                this._checkSpineJson();
                const frame = this._aEffect.currentFrame;
                const loop = this._aEffect.loop;
                const animName = this._spineJson[this._aEffect.userData];
                this._aEffect.gotoAndPlay(frame, loop, animName);
            }
        }
    }

    _showBonusWinMessage() {
        this._showWinMessage("bonus");
    }

    /**
     * Show win message
     * @param {string} [winSize="big_win"]
     */
    _showWinMessage(winSize = "big") {
        OMY.Omy.info('win message on turbo. show. Type:', winSize);
        this._resize();
        this._currentWinLvl = this._maxWinType = winSize;
        if (this._graphic.visible) {
            this._activeSound && OMY.Omy.sound.stop(this._activeSound);
            OMY.Omy.sound.stop(GameConstStatic.S_big_win_show);
            OMY.Omy.sound.stop(GameConstStatic.S_mega_win_show);
            OMY.Omy.sound.stop(GameConstStatic.S_epic_win_show);
            this._lineTimer?.destroy();
            this._lineTimer = null;
            this._timerHideDelay?.destroy();
            this._timerHideDelay = null;
            this._aEffect?.destroy();
            this._aEffect = null;
            this._numberBg?.destroy();
            this._numberBg = null;
        } else {
            this._graphic.visible = true;
        }
        this._activeSound = null;
        this._txtWin.visible = true;
        this._txtWin.scale.set(1);
        this._txtWin.alpha = 0;
        OMY.Omy.remove.tween(this._txtWin);
        AppG.emit.emit(AppConst.APP_START_INC_WIN, AppG.winCredit, AppG.incTimeTake);
        this._txtWin.setNumbers(AppG.winCredit, false);
        OMY.Omy.add.tween(this._txtWin, {
            alpha: 1,
        }, 0.2, null);

        OMY.Omy.sound.play(GameConstStatic.S_cash);
        this._jsonTxt = (AppG.isBonusGame) ? this._gdConf["pos"]["bonus"] : this._gdConf["pos"]["win"];
        let pos;

        switch (this._maxWinType) {
            case this.C_TYPE_SUPER:
            case this.C_TYPE_MEGA:
            case this.C_TYPE_EPIC: {
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboBigWin;
                AppG.showWinTime = AppG.gameConst.forceTurboBigWin;
                this._screenDelay = this._gdConf["screen_big_turbo_delay"];
                pos = this._jsonTxt["txt"]["epic"];
                this._playEndSound = true;
                AppG.emit.emit(GameConstStatic.WIN_MESSAGE_SHOW);
                OMY.Omy.add.tween(this._txtWin, {
                    delay: 0.2,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    repeat: 1,
                    yoyo: true
                }, 0.2);
                /** @type {OMY.OActorSpine} */
                this._aEffect = OMY.Omy.add.actorJson(this._spineCanvas, this._gdConf["spine"]);
                this._checkSpineJson();
                this._aEffect.x = this._jsonTxt["label"]["big"]["x"];
                this._aEffect.y = this._jsonTxt["label"]["big"]["y"];
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
                switch (this._maxWinType) {
                    case this.C_TYPE_EPIC: {
                        OMY.Omy.sound.play(GameConstStatic.S_big_win_show, false);
                        this._activeSound = GameConstStatic.S_big_win_show;
                        this._aEffect.userData = "loop_big";
                        this._aEffect.gotoAndPlay(0, true, this._spineJson["loop_big"]);
                        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_BIG);
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
                break;
            }

            default: {
                AppG.forceIncTimeTake = AppG.gameConst.forceTurboWin;
                AppG.showWinTime = AppG.gameConst.forceTurboWin;
                this._screenDelay = this._gdConf["screen_turbo_delay"];
                if (this._maxWinType === this.C_TYPE_BIG)
                    pos = this._jsonTxt["txt"]["none"];
                else
                    pos = this._jsonTxt["txt"]["big"];
                this._playEndSound = false;
                this._txtWin.scale.set(1);
                OMY.OMath.objectCopy(this._txtWin.json, pos);
                this._txtWin.fontSize = pos["fontSize"];
                this._txtWin.x = pos.x;
                this._txtWin.y = pos.y;
                OMY.Omy.add.tween(this._txtWin, {
                    scaleX: 1.2,
                    scaleY: 1.2,
                    repeat: 1,
                    yoyo: true
                }, 0.2);
            }
        }

        if (!this._debugMessage)
            this._lineTimer = OMY.Omy.add.timer(AppG.showWinTime, this._hideWinMessage, this);

        AppG.updateGameSize(this._graphic);
        AppG.emit.emit(AppConst.APP_SHOW_WIN, (AppG.isRespin) ? AppG.totalWinInSpin : AppG.winCredit, true);
    }

    /**     * @private     */
    _checkSpineJson() {
        if (!this._aEffect) return;
        this._spineJson = (OMY.Omy.isDesktop) ? this._aEffect.json : ((this._isPort) ? this._aEffect.json.port : this._aEffect.json.land);
    }

    _hideWinMessage() {
        this._lineTimer?.destroy();
        this._lineTimer = null;
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
                }, .1, this._messageClear.bind(this));
                if (this._aEffect) {
                    OMY.Omy.add.tween(this._aEffect, {
                        alpha: 0,
                        ease: "none",
                    }, .1);
                }
                if (this._numberBg) {
                    OMY.Omy.add.tween(this._numberBg, {
                        alpha: 0,
                        ease: "none",
                    }, .1);
                }
                break;
            }

            default: {
                OMY.Omy.add.tween(this._txtWin, {
                    alpha: 0,
                    scaleX: this._gdConf["hide_scale"], scaleY: this._gdConf["hide_scale"],
                    ease: "none",
                }, .1, this._messageClear.bind(this));
            }
        }
        AppG.emit.emit(AppConst.APP_HIDE_MESSAGE_WIN);
        AppG.emit.emit(AppConst.APP_STOP_WIN_PARTICLES);
        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
    }

    _messageClear() {
        OMY.Omy.info('win message turbo. hide');
        if (this._activeSound && OMY.Omy.sound.isSoundPlay(this._activeSound)) OMY.Omy.sound.stop(this._activeSound);
        if (this._playEndSound)
            OMY.Omy.sound.play(GameConstStatic.S_big_win_END);
        OMY.Omy.sound.fadeIn(GameConstStatic.S_game_bg, 2);
        this._activeSound = null;

        OMY.Omy.remove.tween(this._txtWin);
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
        this._graphic.visible = false;
    }
}

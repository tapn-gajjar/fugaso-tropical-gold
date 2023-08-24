import {GameConstStatic} from "../../GameConstStatic";
import {Background} from "../../display/Background";
import {MainViewBase} from "../../../casino/gui/pages/MainViewBase";
import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {FreeCounter} from "../../game/kingofthering/FreeCounter";
import {MultiCounter} from "../../game/kingofthering/MultiCounter";
import {LineInGame} from "../../game/kingofthering/LineInGame";

export class MainView extends MainViewBase {
    constructor() {
        super();
        /** @type {ReelBlock} */
        this._reelBlock = null;
        AppG.emit.on(AppConst.APP_HIDE_WIN_EFFECT, this._cleanWinEffect, this);
        AppG.emit.on(AppConst.APP_EMIT_STOP_ALL_EASE_REEL, this._easeStopAllReels, this);
        // AppG.emit.on(AppConst.APP_WAIT_REEL, this._stopWaitSymbolReel, this);
        this.parentGroup = AppG.stage.mainView;
    }

    revive() {
        this._bgGraphic = this.getChildByName("c_game_bg");

        this._reelGraphic = this.getChildByName("reels").getChildByName("reel_canvas");
        // /** @type {OMY.OGraphic} */
        // this._reelWinTint = this.getChildByName("reels").getChildByName("r_win_tint");
        // this._reelWinTint.alpha = 0;

        super.revive();

        OMY.Omy.sound.play(GameConstStatic.S_bg_rs, true);
        OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, .1, .5);
        GameConstStatic.S_game_bg = GameConstStatic.S_bg;
        if (AppG.gameConst.gameHaveIntroInformation) {
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
            this._startIntroInfo();
        } else if (AppG.gameConst.gameHaveIntro) {
            this._startIntro();
            /*if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.fade(GameConstStatic.S_game_bg, 0.3, 0, 0.1);*/
        } else {
            OMY.Omy.sound.fadeIn(GameConstStatic.S_bg_rs, 0.1);
            // OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    /**     * @private     */
    _hideElements() {
        AppG.emit.emit(GameConstStatic.HIDE_GUI);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        this._reelsCanvas.alpha = 0;
        this.getChildByName("c_counter_free").alpha = 0;
        this.getChildByName("c_counter_multi").alpha = 0;
        this.getChildByName("c_logo").alpha = 0;
        if (this.getChildByName("c_jackpot")) this.getChildByName("c_jackpot").alpha = 0;
    }

    /**     * @private     */
    _startIntro() {
        this._hideElements();
        OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true);
    }

    /**     * @private     */
    _startIntroInfo() {
        this._hideElements();
        OMY.Omy.viewManager.showWindow(AppConst.W_INTRO_INFO, true);
    }

    _createGraphic() {
        this.bg = new Background(this._bgGraphic);
        super._createGraphic();

        /** @type {LineInGame} */
        this._lineInGame = new LineInGame(this.getChildByName("c_numbers"), this._reelBlock.activeList);
        this._lineInGame.linesGraphic = this.getChildByName("c_lines");
        // this._lineInGame.hide();
        this.getChildByName("c_lines").parentGroup = AppG.stage.mainViewUpper;
        // this.getChildByName("c_logo").parentGroup = AppG.stage.mainViewUpper;

        // /** @type {OMY.OContainer} */
        // this._reelWaitCanvas = this.getChildByName("reels").getChildByName("c_effects");
        // this._reelWaitCanvas.setAll("visible", false);
        this._isWaitEffect = false;

        /** @type {OMY.OContainer} */
        this._reelsCanvas = this.getChildByName("reels");

        AppG.emit.on(AppConst.APP_SHOW_BIG_WIN, this._onShowBigWin, this);

        /** @type {FreeCounter} */
        this._counterFree = new FreeCounter(this.getChildByName("c_counter_free"));
        /** @type {MultiCounter} */
        this._counterMulti = new MultiCounter(this.getChildByName("c_counter_multi"));

        /** @type {OMY.OActorSpine} */
        this._aWild = OMY.Omy.viewManager.gameUI.getChildByName("a_wild");
        this._aWild.visible = false;
        this._aWild.addSpineEvent(this._onWildEvent, this, false);
        this._aWild.addComplete(this._onWildComplete, this, false);

        AppG.emit.on(AppConst.EMIT_NEXT_FREE, this._updateFire, this);
        /** @type {Array.<OMY.OActorSpine>} */
        this._freeLvls = [
            this._reelsCanvas.getChildByName("a_level_1"),
            this._reelsCanvas.getChildByName("a_level_2"),
            this._reelsCanvas.getChildByName("a_level_3"),
        ];
        this._freeLvls.forEach((actor) => {
            actor.gotoAndStop(0);
            actor.visible = false;
        });

        /** @type {OMY.OGraphic} */
        this._respinTint = this.getChildByName("r_free_tint");
        this._respinTint.visible = false;

        /** @type {OMY.OGraphic} */
        this._bigWinTint = this._reelsCanvas.getChildByName("r_big_win");
        this._bigWinTint.visible = false;

        OMY.Omy.navigateBtn.addUpdateState(this._onUpdateBtnState, this);
        AppG.emit.on(GameConstStatic.E_WILD_ON_SCREEN, this._wildOnScreen, this);
    }

    _updateGameSize(dx, dy, isScreenPortrait) {
        super._updateGameSize(dx, dy, isScreenPortrait);
        this._updateTintSize();
    }

    // region tint free:
    //-------------------------------------------------------------------------

    /**     * @private     */
    _updateTintSize() {
        if (this._respinTint.visible) {
            this._respinTint.width = OMY.Omy.WIDTH + 20;
            this._respinTint.height = OMY.Omy.HEIGHT + 20;
            this._respinTint.x = -this.x - 10;
            this._respinTint.y = -this.y - 10;
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    // region wild:
    //-------------------------------------------------------------------------
    randomWild() {
        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_BIG);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        this._aWild.visible = true;
        this._aWild.gotoAndPlay(0);
        this._aWild.alpha = 1;
        OMY.Omy.sound.play(GameConstStatic.S_show_wild);
    }

    /**     * @private     */
    _onWildEvent(spine, event) {
        switch (event.data.name) {
            case "change": {
                this._reelBlock.addWild();
                break;
            }
            case "shake": {
                let ease = OMY.Omy.Ease.add(this, this._gdConf["shake"], this._gdConf["shake_option_wild"]);
                ease.once('complete', this._endShakeReels, this);
                OMY.Omy.sound.play(GameConstStatic.S_wild_shake);
                break;
            }
        }
    }

    /**     * @private     */
    _onWildComplete() {
        AppG.emit.emit(GameConstStatic.WIN_MESSAGE_HIDE);
        OMY.Omy.add.timer(0.2, this._onDelayWild, this);
    }

    /**     * @private     */
    _onDelayWild() {
        OMY.Omy.add.tween(this._aWild, {alpha: 0}, 0.2);
        OMY.Omy.add.timer(0.3, this._continueGame, this);
    }

    /**     * @private     */
    _continueGame() {
        this._aWild.visible = false;
        AppG.state.endShowWild();
    }

    //-------------------------------------------------------------------------
    //endregion

    // region spin:
    //-------------------------------------------------------------------------
    sendSpin() {
        OMY.Omy.sound.play(GameConstStatic.S_reel_bg, true);

        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_intro)) OMY.Omy.sound.stop(GameConstStatic.S_intro);
        this._activeWaitReelIndex = -1;

        super.sendSpin();
    }

    onSendSpin() {
        super.onSendSpin();
    }

    skipSpin() {
        // this._clearWaitEffect();
        if (AppG.isMoveReels) {
            this._needOnWildWait = false;
            if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg)) {
                OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
            }
        }
        super.skipSpin();
    }

    /**     * @private     */
    _easeStopAllReels() {
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_reel_bg))
            OMY.Omy.sound.stop(GameConstStatic.S_reel_bg);
        AppG.emit.emit(AppConst.APP_EMIT_SKIP_BLOCK);
    }

    _spinEnd() {
        super._spinEnd();
        this._clearWaitEffect();
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait)) OMY.Omy.sound.stop(GameConstStatic.S_wild_wait);
    }

    _onReelStops(reelId) {
        super._onReelStops(reelId);
    }

    /**     * @private     */
    _onReelEaseStops(reelId) {
        super._onReelEaseStops(reelId);
    }

//-------------------------------------------------------------------------
    //endregion

    // region scatter wait:
    //-------------------------------------------------------------------------
    /**     * @private     */
    _stopWaitSymbolReel(reelId, waitSymbol) {
        if (!this._isWaitEffect) {
            this._isWaitEffect = true;
            /*for (let i = 0; i < reelId; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].holdSymbol();
                }
            }*/
        } /*else {
             for (let j = 0; j < this._reelBlock.activeList[reelId - 1].length; j++) {
                 this._reelBlock.activeList[reelId - 1][j].holdSymbol();
             }
         }*/
        this._offWaitEffect();
        this._onWaitEffect(reelId);

    }

    /**     * @private     */
    _offWaitEffect() {
        if (this._activeWaitEffect) {
            OMY.Omy.remove.tween(this._activeWaitEffect);
            OMY.Omy.add.tween(this._activeWaitEffect, {
                alpha: 0,
                onCompleteParams: [this._activeWaitEffect]
            }, this._reelWaitCanvas.json["alpha_time"], (spine) => {
                spine.stop();
                spine.visible = false;
            });
            this._activeWaitEffect = null;
        }
    }

    /**     * @private     */
    _onWaitEffect(reelId) {
        if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_wait)) OMY.Omy.sound.play(GameConstStatic.S_wild_wait, true);
        this._activeWaitReelIndex = reelId;
        this._reelBlock._reelList[reelId].stopMoveSpeed();
        this._activeWaitEffect = this._reelWaitCanvas.getChildByName("reel_" + String(reelId));
        OMY.Omy.remove.tween(this._activeWaitEffect);
        this._activeWaitEffect.visible = true;
        this._activeWaitEffect.alpha = 0;
        this._activeWaitEffect.gotoAndPlay(0, true);
        OMY.Omy.add.tween(this._activeWaitEffect, {alpha: 1}, this._reelWaitCanvas.json["alpha_time"]);
    }

    /**     * @private     */
    _clearWaitEffect() {
        if (this._isWaitEffect) {
            OMY.Omy.sound.stop(GameConstStatic.S_scatter_wait);
            for (let i = 0; i < this._reelBlock.activeList.length; i++) {
                for (let j = 0; j < this._reelBlock.activeList[i].length; j++) {
                    this._reelBlock.activeList[i][j].unHoldSymbol();
                }
            }
            this._isWaitEffect = false;
            this._needOnWildWait = false;
            this._activeWaitReelIndex = -1;
            this._offWaitEffect();
        }
    }

    //-------------------------------------------------------------------------
    //endregion
    // region :wild on screen
    //-------------------------------------------------------------------------
    /**     * @private     */
    _wildOnScreen() {
        OMY.Omy.Ease.removeEase(this);
        let ease = OMY.Omy.Ease.add(this, this._gdConf[(AppG.isScreenPortrait) ? "shake_reel_wild_v" : "shake_reel_wild"],
            this._gdConf["shake_option_reel_wild"]);
        ease.once('complete', this._endShakeReels, this);
    }

    //-------------------------------------------------------------------------
    //endregion
    // region BONUS GAME: WHEEL
    //-------------------------------------------------------------------------

    _startBonusGame() {
        AppG.emit.once(AppConst.APP_BONUS_CLOSE, this._onEndBonusGame, this);

        super._startBonusGame();
        this._logo.startBonusGame();
        OMY.Omy.add.tween(this.getChildByName("reels"), {alpha: 0, delay: 1}, this._gdConf["time_hide_reel"], null);
    }

    _continueShowBonus() {
        OMY.Omy.viewManager.showWindow(AppConst.W_BONUS, true, OMY.Omy.viewManager.gameUI.getWindowLayer("c_wheel_layer"));
        // super._continueShowBonus();
    }

    /**     * @private     */
    _onEndBonusGame() {
        this._logo.endBonusGame();
        OMY.Omy.add.tween(this.getChildByName("reels"), {alpha: 1}, this._gdConf["time_hide_reel"], null);
    }

//-------------------------------------------------------------------------
    //endregion

    // region FREE GAME
    //-------------------------------------------------------------------------

    startFreeGame() {
        super.startFreeGame();

        // OMY.Omy.sound.stop(GameConstStatic.S_game_bg);
        // GameConstStatic.S_game_bg = GameConstStatic.S_bg_fg;
    }

    _continueStartFree() {
        AppG.emit.emit(AppConst.EMIT_FREE_GAME_BEGIN);
        if (AppG.serverWork.haveFreeOnStart) {
            this._showFreeWindow();
        } else {
            OMY.Omy.add.tween(this._reelBlock, {
                alpha: this._gdConf["no_win_alpha"]
            }, this._gdConf["timer_hide_reels"]);
            OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeWindow, this);
        }
        this._counterFree.startFree();
        if (AppG.totalFreeGame > 3) {
            OMY.Omy.sound.play(GameConstStatic.S_fg_start);
            OMY.Omy.add.timer(3.5, this._soundFreeStartPlay, this);
        } else {
            OMY.Omy.sound.play(GameConstStatic.S_fg_start2);
            OMY.Omy.add.timer(2.0, this._soundFreeStartPlay, this);
        }
        if (!this._respinTint.visible) {
            this._respinTint.visible = true;
            this._respinTint.alpha = 0;
            this._updateTintSize();
        }
        OMY.Omy.remove.tween(this._respinTint);
        OMY.Omy.add.tween(this._respinTint, {alpha: this._respinTint.json["alpha_lvl"][AppG.totalFreeGame - 1]}, 1);
        this._fireLvl = -1;
        this._updateFire();
    }

    /**     * @private     */
    _soundFreeStartPlay() {
        OMY.Omy.sound.play(GameConstStatic.S_fg_sound);
    }

    /**     * @private     */
    _showFreeWindow() {
        if (this._reelBlock.alpha !== 1) OMY.Omy.add.tween(this._reelBlock, {
            alpha: 1
        }, 0.1);
        AppG.state.startNewSession();
    }

    finishFreeGame() {
        OMY.Omy.info('view. finish free game');
        AppG.autoGameRules.bonusGameOff();
        if (AppG.autoGameRules.isAutoPause) {
            AppG.autoGameRules.continueAutoGame();
        }
        AppG.autoStart = false;
        AppG.isFreeGame = false;
        OMY.Omy.navigateBtn.updateState(AppConst.C_END_FREE_GAME);
        this._continueEndFree();
    }

    _continueEndFree() {
        AppG.emit.emit(AppConst.EMIT_FREE_GAME_END);
        this._counterFree.endFree();
        AppG.isEndFree = false;
        AppG.state.startNewSession();
        OMY.Omy.sound.stop(GameConstStatic.S_fg_sound);
        OMY.Omy.sound.play(GameConstStatic.S_fg_end);
        OMY.Omy.add.tween(this._respinTint, {
            alpha: 0, onCompleteParams: [this._respinTint],
        }, 1, (rect) => {
            rect.visible = false;
        });

        for (let i = 0; i < this._freeLvls; i++) {
            OMY.Omy.add.tween(this._freeLvls[i], {alpha: 0}, .39);
        }
        OMY.Omy.add.timer(0.4, this._stopFreeEffectLvls, this);
    }

    /**     * @private     */
    _stopFreeEffectLvls() {
        this._freeLvls.forEach((actor) => {
            actor.gotoAndStop(0);
            actor.visible = false;
            actor.alpha = 1;
        });
    }

    /**     * @private     */
    _updateFire(forceCount = -1) {
        if (this._fireLvl === AppG.countFreeGame && forceCount === -1) return;
        this._fireLvl = (forceCount === -1) ? AppG.countFreeGame : forceCount;
        let m = (this._fireLvl < this._freeLvls.length) ? this._fireLvl + 1 : this._freeLvls.length;
        for (let i = 0; i < m; i++) {
            if (!this._freeLvls[i].visible) {
                this._freeLvls[i].visible = true;
                this._freeLvls[i].alpha = 0;
                OMY.Omy.add.tween(this._freeLvls[i], {alpha: 1}, .1);
                this._freeLvls[i].gotoAndPlay(0, true);
            }
        }
    }

    freeInFree() {
        /*this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._activeList.map((a, index, array) => a.map((b, index, array) => b.scatterFree(true)));
        OMY.Omy.add.timer(this._gdConf["timer_start_free"], this._showFreeInFreeWindow, this);*/
    }

    /*/!**     * @private     *!/
    _showFreeInFreeWindow() {
        this._freeInFreeMess.visible = true;
        this._freeInFreeMess.alignContainer();
        this._freeInFreeMess.alpha = 0;
        this._freeInFreeMess.scale.set(0);
        OMY.Omy.sound.play(GameConstStatic.S_fg_in_free);
        this._freeInFreeMess.setXY(this._freeInFreeMess.json.x, this._freeInFreeMess.json.y);
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 1, scaleY: 1, alpha: 1, ease: this._freeInFreeMess.json["ease_show"],
        }, this._freeInFreeMess.json["tween_show"], this._inFreeDelay.bind(this));
    }

    /!**     * @private     *!/
    _inFreeDelay() {
        OMY.Omy.add.timer(this._freeInFreeMess.json["delay_screen"], this._hideInFreeMess, this);
    }

    /!**     * @private     *!/
    _hideInFreeMess() {
        const hidePos = this._freeInFreeMess.json["tween_hide_pos"];
        OMY.Omy.add.tween(this._freeInFreeMess, {
            scaleX: 0, scaleY: 0, alpha: 0, ease: this._freeInFreeMess.json["ease_hide"],
            x: hidePos.x, y: hidePos.y,
        }, this._freeInFreeMess.json["tween_hide"], this._onInFreeMessHide.bind(this));
    }

    /!**     * @private     *!/
    _onInFreeMessHide() {
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        AppG.serverWork.updateTotalFreeGame();
        AppG.state.gameOver();
    }*/

//-------------------------------------------------------------------------
    //endregion

    // region Re-Spin:
    //-------------------------------------------------------------------------

    startRespinGame(onStart = false) {
        super.startRespinGame(onStart);
        return false;
    }

    nextRespinGame() {
        super.nextRespinGame();
    }

    finishRespinGame(onWin = false) {
        super.finishRespinGame();
        return false;
    }

//-------------------------------------------------------------------------
    //endregion

    // region win on lines:
    //-------------------------------------------------------------------------
    showWinCombo() {
        /*switch (this._dataWin.maxCountSymbol) {
            case 5: {
                OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
                break;
            }
        }*/
        if (AppG.isSuperTurbo) {
            this._showWinTurbo();
            return;
        }

        OMY.Omy.info('view. show win combo');
        AppG.emit.emit(AppConst.EMIT_WIN);
        OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
        this._playWinAnimation = true;
        this._isShowingWinLines = true;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;
        this._isShowMessage = false;
        this._countLine = 0;
        this._configShowLine();

        this._calcAutoRulesWin(AppG.serverWork.spinWin);
        this._calcAllSpinWin(AppG.serverWork.spinWin);
        this._calcWinTime();
        /*if (!this._incWinByLine) {
            if (this._gameHaveBigMess) {
                this._checkWinMessageEffect();
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
            }
        }*/

        this._showOneLineWinAnimations();
        this._counterMulti.winInGame();
        // this._showAllWinLines();
        // this._showingWinTimer = OMY.Omy.add.timer(AppG.showWinTime, this._endShowWinLines, this);

        // if (AppG.winCoef > 100) OMY.Omy.sound.play(GameConstStatic.S_show_win_5);
        // else if (AppG.winCoef > 30) OMY.Omy.sound.play(GameConstStatic.S_show_win_4);
        // else if (AppG.winCoef > 10) OMY.Omy.sound.play(GameConstStatic.S_show_win_3);
        // OMY.Omy.remove.tween(this._reelWinTint);
        // OMY.Omy.add.tween(this._reelWinTint, {alpha: 1}, 0.2);
        // this._showingWinTimer?.destroy();
        // this._showingWinTimer = null;
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._endShowWinLines, this);
    }


    _showWinTurbo() {
        this._playWinAnimation = true;
        this._isShowingWinLines = true;
        this._isAnimationsSkiped = false;
        this._playLoopAnimations = false;
        this._isShowMessage = false;
        this._countLine = 0;
        this._counterMulti.winInGame();
        super._showWinTurbo();
    }

    _showAllWinLinesTurbo() {
        OMY.Omy.info('view. start show all win line turbo');
        this._dataWin.repeatWins();
        this._winEffect.show();

        OMY.Omy.sound.play(GameConstStatic.S_win_line_1 + String(OMY.OMath.randomRangeInt(1, 5)));
        this._resetArrayWinData();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            // this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            if (!this._dataWin.isScatter)
                this._lineInGame.showWinLine(this._dataWin.line, false, false, false, this._dataWin.countSymbol);
            this._animateWinLine();
        }
        // this._reelBlock.updateWinState(this._arrayWinData);

        this._dataWin.repeatWins();
    }

    _checkWinMessageTurbo() {
        OMY.Omy.info('view. win coef in turbo:', AppG.winCoef);
        this._isShowMessage = true;
        OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
        if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
            OMY.Omy.sound.play(GameConstStatic.S_start_big_win_effect);
            OMY.Omy.sound.fadeOut(GameConstStatic.S_start_big_win_effect, 2);

            if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN_TURBO, AppG.winCredit);
            } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN_TURBO, AppG.winCredit);
            }
        } else {
            if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
                AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN_TURBO, AppG.winCredit);
            } else {
                AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN_TURBO, AppG.winCredit);
            }
            this._bigWinTint.visible = true;
            this._bigWinTint.alpha = 0;
            OMY.Omy.add.tween(this._bigWinTint, {alpha: 1}, 0.2);
            AppG.emit.emit(GameConstStatic.REEL_WIN_TINT_SHOW);
        }
        this._showWinParticles();
    }

    _calcWinTime() {
        let allLinesTime = 0;
        /*this._dataWin.repeatWins();
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();
            allLinesTime += this._settingNextLineTime();
        }
        this._dataWin.repeatWins();*/
        AppG.showWinTime = Math.max(allLinesTime, AppG.incTimeTake + this._timeMessageOnScreen);
        OMY.Omy.info('view. calc win time', AppG.showWinTime);
    }

    _calcAllSpinWin(winValue) {
        OMY.Omy.info('view. calc win value', winValue);
        //почати нараховувати виграш весь зразу
        AppG.winCredit = winValue;
        AppG.winCoef = AppG.winCredit / AppG.serverWork.betForLimit;
        AppG.getTimeByWinValue(AppG.winCredit, AppG.gameConst.getData("gui_inc_conf"), true);
    }

    /**     * @private     */
    _endShakeReels() {
        AppG.updateGameSize(this);
    }

    _showWinLine() {
        OMY.Omy.info('view. show line. end show:', this._dataWin.endLines);
        if (this._dataWin.endLines) {
            let timeDelay = AppG.gameConst.getData("before_lines_sec");
            if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate")) {
                OMY.Omy.sound.play(GameConstStatic.S_start_big_win_effect);
                OMY.Omy.sound.fadeOut(GameConstStatic.S_game_bg, 0.1);
                OMY.Omy.navigateBtn.updateState(AppConst.C_BLOCK);
                // timeDelay = AppG.gameConst.getData("win_message_sec");

                // let ease = OMY.Omy.Ease.add(this, this._gdConf["shake"], this._gdConf["shake_option"]);
                // ease.once('complete', this._endShakeReels, this);
                OMY.Omy.sound.fadeOut(GameConstStatic.S_start_big_win_effect, 7);
            }
            this._lineTimer = OMY.Omy.add.timer(timeDelay, this._checkWinMessageEffect, this);
            return;
        }

        // if (this._clearReelsOnWin) this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        // this._winEffect.clearEffect();
        this._dataWin.nextLine();

        let allowArray = this.findWinSymbols(this._dataWin, false, true, this._showOnWinNoWinSymbols);
        // this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter);
        // this._reelBlock.updateWinState(allowArray);
        if (this._dataWin.isScatter) this._lineInGame.showWinLineScatter(); else this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);
        // if (this._incWinByLine) AppG.winCredit += this._dataWin.credit;

        this._animateWinLine();

        // if (this._incWinByLine) AppG.emit.emit(AppConst.APP_SHOW_WIN, AppG.winCredit);
        this._lineTimer = OMY.Omy.add.timer(this._settingNextLineTime(), this._showWinLine, this);
        if (++this._countLine > 5) this._countLine = 5;
        OMY.Omy.sound.play(GameConstStatic.S_win_line_1 + String(this._countLine));
    }

    _checkWinMessageEffect() {
        OMY.Omy.info('view. win coef:', AppG.winCoef);
        this._isShowMessage = true;
        OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
        if (AppG.winCoef >= AppG.gameConst.getData("super_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_SUPER_MEGA_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("mega_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_MEGA_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("epic_win_rate") && this._gameHaveBigMess) {
            AppG.emit.emit(AppConst.APP_SHOW_EPIC_WIN, AppG.winCredit);
        } else if (AppG.winCoef >= AppG.gameConst.getData("big_win_rate") && this._gameHaveBigMess) {
            // OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
            AppG.emit.emit(AppConst.APP_SHOW_BIG_WIN, AppG.winCredit);
            this._bigWinTint.visible = true;
            this._bigWinTint.alpha = 0;
            OMY.Omy.add.tween(this._bigWinTint, {alpha: 1}, 0.2);
            AppG.emit.emit(GameConstStatic.REEL_WIN_TINT_SHOW);
        } else {
            // OMY.Omy.navigateBtn.updateState(AppConst.C_WIN);
            AppG.emit.emit(AppConst.APP_SHOW_MESSAGE_WIN, AppG.winCredit);
            this._bigWinTint.visible = true;
            this._bigWinTint.alpha = 0;
            OMY.Omy.add.tween(this._bigWinTint, {alpha: 1}, 0.2);
            AppG.emit.emit(GameConstStatic.REEL_WIN_TINT_SHOW);
        }
        this._showWinParticles();
        // const sec = AppG.gameConst.getData("win_message_sec") + AppG.gameConst.getData("before_lines_sec");
        // this._lineTimer = OMY.Omy.add.timer(sec, this._endShowWinLines, this);
    }

    _animateLoopLine() {
        // if (this._reelWinTint.alpha !== 1) {
        //     OMY.Omy.remove.tween(this._reelWinTint);
        //     OMY.Omy.add.tween(this._reelWinTint, {alpha: 1}, 0.2);
        // }
        super._animateLoopLine();
    }

    _showLoopLine() {
        if (this._dataWin.endLines) {
            this._dataWin.repeatWins();
        }

        this._lineInGame.hideWinEffect();
        if (this._clearReelsOnWin) this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
        this._winEffect.clearEffect();
        this._dataWin.nextLine();
        this._animateLoopLine();

        let allowArray = this.findWinSymbols(this._dataWin, false, true, this._showLoopNoWinSymbols);
        this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter, true);
        this._reelBlock.updateWinState(allowArray);
        // if (this._dataWin.isScatter) this._lineInGame.showWinLineScatter(); else this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWinLoop, !this._dataWin.isScatter);
        if (this._dataWin.countLinesWin !== 1) this._lineTimer = OMY.Omy.add.timer(this._timeShowLoopLine, this._showLoopLine, this);
        OMY.Omy.sound.play(GameConstStatic.S_loop_win);
    }

    _animateWinLine() {
        super._animateWinLine();
        /*if (!this._isAnimationsSkiped || this._dataWin.isBonusWin || this._dataWin.isScatter) {
            if (this._winSymbolSound)
                OMY.Omy.sound.stop(this._winSymbolSound);
            this._winSymbolSound = null;
            switch (this._dataWin.winSymbol) {
                default: {
                    this._winSymbolSound = GameConstStatic["S_symbol_" + String(this._dataWin.winSymbol)];
                    break;
                }
            }
            OMY.Omy.sound.play(this._winSymbolSound);
        }*/
    }

    _skipWinAnimations() {
        if (!this._isShowingWinLines) return;
        if (this._isAnimationsSkiped) return;
        OMY.Omy.info('view. skip win');
        this._isAnimationsSkiped = true;
        this._lineTimer?.destroy();
        this._showingWinTimer?.destroy();

        // OMY.Omy.remove.tween(this._reelWinTint);
        // OMY.Omy.add.tween(this._reelWinTint, {alpha: 0}, 0.2);
        this._lineInGame.hideWinEffect();
        this._winEffect.hide();
        this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
        if (!this._isShowMessage) this._checkWinMessageEffect();
    }

    _endShowWinLines() {
        /*AppG.emit.emit(AppConst.APP_WIN_PARTICLES, AppG.winCredit);

        this._checkEndShowLines();
        AppG.emit.once(AppConst.APP_HIDE_MESSAGE_WIN, this._onHideWinMessage, this);
        this._showingWinTimer?.destroy();
        if (this._lineTimer) {
            this._lineTimer.destroy();
            this._lineTimer = null;
        }
        this._isShowingWinLines = false;*/
        if (this._bigWinTint.visible) {
            AppG.emit.emit(GameConstStatic.REEL_WIN_TINT_HIDE);
            OMY.Omy.add.tween(this._bigWinTint, {alpha: 0, onCompleteParams: [this._bigWinTint]}, .1, (target) => {
                target.visible = false
            });
        }
        super._endShowWinLines();
    }

    /**     * @private     */
    _checkEndShowLines() {
        /*if (WinMessage.incAnim) {
            return;
        }*/
        this._dataWin.repeatWins();
        this._lineInGame.hideWinEffect();
        this._winEffect.hide();
        this._winEffect.show();

        if (this._clearReelsOnWin) {
            // this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NO_WIN);
            this._resetArrayWinData();
        } else {
            this._resetArrayWinData(AppConst.SLOT_SYMBOL_NONE);
        }
        while (!this._dataWin.endLines) {
            this._dataWin.nextLine();

            let allowArray = this.findWinSymbols(this._dataWin, false, false, this._showOnWinNoWinSymbols);
            this._winEffect.showWinSymbol(allowArray, this._isAnimationsSkiped && !this._dataWin.isBonusWin && !this._dataWin.isScatter, true);
            for (let i = 0; i < allowArray.length; i++) {
                let index = AppG.convertID(allowArray[i].reelId, allowArray[i].symbolId);
                if (this._arrayWinData[index].type !== AppConst.SLOT_SYMBOL_WIN && allowArray[i].type === AppConst.SLOT_SYMBOL_WIN) {
                    AppG.setWinSymbolD(this._arrayWinData[index]);
                    this._arrayWinData[index] = allowArray[i];
                }
            }
            /*if (this._dataWin.isScatter)
                this._lineInGame.showWinLineScatter();
            else
                this._lineInGame.showWinLine(this._dataWin.line, this._clearLinesOnWin, !this._dataWin.isScatter);

            this._animateWinLine();*/
        }
        this._reelBlock.updateWinState(this._arrayWinData);
    }

    startLoopAnimation(force = false) {
        if (AppG.isAutoGame && !force) return;
        if (this._playLoopAnimations) return;

        OMY.Omy.add.tween(this._reelBlock, {alpha: this._gdConf["no_win_alpha"]}, this._gdConf["no_win_alpha_time"]);
        this._lineTimer?.destroy();
        if (this._gdConf["wait_delay_loop"]) {
            // OMY.Omy.remove.tween(this._reelWinTint);
            // OMY.Omy.add.tween(this._reelWinTint, {alpha: 0}, 0.2);
            this._lineInGame.hideWinEffect();
            this._winEffect.hide();
            this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
            this._delayLoopTimer = OMY.Omy.add.timer(this._gdConf["wait_delay_loop"], this._onWaitDelayLoop, this);
        } else {
            super.startLoopAnimation();
        }
        /*if (this._dataWin.countLinesWin !== 1) {
            if (!this._playLoopAnimations) {
                super.startLoopAnimation();
            } else {
                if (this._gdConf["wait_delay_loop"]) {
                    this._lineInGame.hideWinEffect();
                    this._winEffect.hide();
                    this._reelBlock.updateToState(AppConst.SLOT_SYMBOL_NONE);
                    this._delayLoopTimer = OMY.Omy.add.timer(this._gdConf["wait_delay_loop"], this._onWaitDelayLoop, this);
                } else {
                    super.startLoopAnimation();
                }
            }
        } else {
            if (!this._playLoopAnimations)
                super.startLoopAnimation();
        }*/
    }

    findWinSymbols(dataWin, playSound = true, dispatch = true, noWin = false) {
        dispatch = this._playLoopAnimations;
        return super.findWinSymbols(dataWin, playSound, dispatch, noWin);
    }

    hideWin() {
        this._delayLoopTimer?.destroy();
        if (this._reelBlock.alpha !== 1) {
            this._reelBlock.alpha = 1;
            OMY.Omy.remove.tween(this._reelBlock);
        }

        // OMY.Omy.remove.tween(this._reelWinTint);
        // OMY.Omy.add.tween(this._reelWinTint, {alpha: 0}, 0.2);
        return super.hideWin();
    }

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onWaitDelayLoop() {
        this._delayLoopTimer = null;
        super.startLoopAnimation();
    }

    /**     * @private     */
    _cleanWinEffect() {

    }

    // region work with windows:
    //-------------------------------------------------------------------------
    _onPayWindowOpen() {
        super._onPayWindowOpen();
        // this.getChildByName("reels").getChildByName("reel_canvas").alpha = 0;
        // this.getChildByName("reels").alpha = 0;
        // this.getChildByName("c_numbers").alpha = 0;
        // this.getChildByName("c_lines").alpha = 0;
        // this.getChildByName("c_logo").alpha = 0;
    }

    _onPayWindowClose() {
        super._onPayWindowClose();
        // this.getChildByName("reels").getChildByName("reel_canvas").alpha = 1;
        // this.getChildByName("reels").alpha = 1;
        // this.getChildByName("c_numbers").alpha = 1;
        // this.getChildByName("c_lines").alpha = 1;
        // this.getChildByName("c_logo").alpha = 1;
    }

    _onIntroWindowClose() {
        if (!AppG.beginFreeGame && !AppG.isFreeGame) {
            GameConstStatic.S_game_bg = GameConstStatic.S_bg;
            // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
            //     OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
        }
        OMY.Omy.sound.pauseAll();
        OMY.Omy.sound.resumeAll();
        super._onIntroWindowClose();

        OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.1, 1);
        OMY.Omy.sound.play(GameConstStatic.S_show_reel);

        this._onShowAll();
    }

    /**     * @private     */
    _onShowAll() {
        this._timeLine = OMY.Omy.add.tweenTimeline({
            onComplete: this._onShowElements.bind(this)
        });
        OMY.Omy.add.tween(this._reelsCanvas, {alpha: 1}, 0.5, null, null, this._timeLine, 0);
        OMY.Omy.add.tween(this.getChildByName("c_counter_free"), {alpha: 1}, 0.5, null, null, this._timeLine, 0);
        OMY.Omy.add.tween(this.getChildByName("c_counter_multi"), {alpha: 1}, 0.5, null, null, this._timeLine, 0);
        OMY.Omy.add.tween(this.getChildByName("c_logo"), {alpha: 1}, 0.5, null, null, this._timeLine, 0);
    }

    /**     * @private     */
    _onShowElements() {
        this._timeLine = null;
        AppG.state.startNewSession();
    }

    /**     * @private     */
    _onShakeDelay() {
        OMY.Omy.add.timer(.2, this._onShake, this);
    }

    /**     * @private     */
    _onShake() {
        let ease = OMY.Omy.Ease.add(this, this._gdConf["shake"], this._gdConf["shake_option_reel"]);
        ease.once('complete', this._endShakeReels, this);
    }

    _onIntroInfoClose() {
        super._onIntroInfoClose();
        if (AppG.gameConst.gameHaveIntro) {
            OMY.Omy.viewManager.showWindow(AppConst.W_INTRO, true);
        } else {
            if (!AppG.beginFreeGame && !AppG.isFreeGame) {
                GameConstStatic.S_game_bg = GameConstStatic.S_bg;
                // if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_game_bg))
                //     OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
            }

            OMY.Omy.sound.pauseAll();
            OMY.Omy.sound.resumeAll();
        }
    }

    //-------------------------------------------------------------------------
    //endregion

    /**     * @private     */
    _onShowBigWin() {
    }

    /**     * @private     */
    _onUpdateBtnState(btnState) {
        switch (btnState) {
            case AppConst.C_COLLECT: {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_gamble_wait)) OMY.Omy.sound.play(GameConstStatic.S_gamble_wait, true);
                break;
            }
        }
    }

    get activeWaitReelIndex() {
        return this._activeWaitReelIndex;
    }
}

import {AppG} from "../casino/AppG";
import {AppConst} from "../casino/AppConst";
import {MainView} from "./guiStates/pages/MainView";
import {PaytableWindow} from "./guiStates/PaytableWindow";
import {GuiDesktop} from "./guiStates/gui/GuiDesktop";
import {GuiMobile} from "./guiStates/gui/GuiMobile";
import {SlotStateBase} from "../casino/SlotStateBase";
import {HistoryWindow} from "./guiStates/HistoryWindow";
import {LocalisationWindow} from "../casino/gui/windows/LocalisationWindow";
import {BetWindow} from "./guiStates/BetWindow";
import {MenuWindow} from "./guiStates/MenuWindow";
import {CalcWindow} from "../casino/gui/windows/CalcWindow";
import {WarningReality} from "../casino/gui/windows/WarningReality";
import {IntroWindow} from "./guiStates/IntroWindow";
import {GameConstStatic} from "./GameConstStatic";
import {IntroInfoWindow} from "./guiStates/IntroInfoWindow";
import {SettingWindow} from "../casino/gui/windows/SettingWindow";

export class SlotState extends SlotStateBase {
    constructor() {
        super();
    }

    showGame() {
        OMY.Omy.assets.addChars2BitmapFont("t_history_font", AppG.currency,
            AppG.gameConst.getData("t_history_font_config"));
        OMY.Omy.assets.addChars2BitmapFont("ui_number_font", AppG.currency,
            AppG.gameConst.getData("font")["ui_number_font_config"]);
        OMY.Omy.assets.addChars2BitmapFont("reality_font", AppG.currency,
            AppG.gameConst.getData("font")["reality_font_config"]);
        if (OMY.Omy.isDesktop) {
            OMY.Omy.assets.addChars2BitmapFont("ui_stroke_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_stroke_number_font_config"]);
        } else {
            OMY.Omy.assets.addChars2BitmapFont("ui_stroke_mobile_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_stroke_mobile_number_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("ui_menu_number_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_menu_number_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("calc_font", AppG.currency,
                AppG.gameConst.getData("font")["calc_font_config"]);
            OMY.Omy.assets.addChars2BitmapFont("ui_menu_font", AppG.currency,
                AppG.gameConst.getData("font")["ui_menu_font_config"]);
        }

        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.addTopGui(new GuiDesktop());
        } else {
            OMY.Omy.viewManager.addTopGui(new GuiMobile());
        }

        /*if (AppG.isGameDrop) this._mainView = new MainDropView();
        else */
        this._mainView = new MainView();
        OMY.Omy.viewManager.regWO(this._mainView, AppConst.P_VIEW_MAIN);
        OMY.Omy.viewManager.regWO(new WarningReality(), AppConst.W_REALITY);

        if (AppG.gameConst.gameHaveIntro)
            OMY.Omy.viewManager.regWO(new IntroWindow(), AppConst.W_INTRO);
        if (AppG.gameConst.gameHaveIntroInformation)
            OMY.Omy.viewManager.regWO(new IntroInfoWindow(), AppConst.W_INTRO_INFO);
        // OMY.Omy.viewManager.regWO(new GambleWindow(), AppConst.W_GAMBLE);

        // OMY.Omy.viewManager.regWO(new BonusWheelWindow(), AppConst.W_BONUS);
        if (AppG.gameHaveFree) {
            // OMY.Omy.viewManager.regWO(new FreeGameBeginWindow(), AppConst.W_FREE_GAME_BEGIN);
            // OMY.Omy.viewManager.regWO(new FreeGameEndWindow(), AppConst.W_FREE_GAME_END);
            // OMY.Omy.viewManager.regWO(new FreeInFreeWindow(), AppConst.W_FREE_IN_FREE);
            // OMY.Omy.viewManager.regWO(new FreeBuyWindow(), AppConst.W_BUY_FREE);
        }
        if (OMY.Omy.isDesktop) {
            OMY.Omy.viewManager.regWO(new PaytableWindow(), AppConst.W_PAY);
            OMY.Omy.viewManager.regWO(new HistoryWindow(), AppConst.W_HISTORY);
            OMY.Omy.viewManager.regWO(new LocalisationWindow(), AppConst.W_LOCALISATION);
            OMY.Omy.viewManager.regWO(new SettingWindow(), AppConst.W_SETTING);
        } else {
            OMY.Omy.viewManager.regWO(new BetWindow(), AppConst.W_BET_SETTINGS);
            OMY.Omy.viewManager.regWO(new MenuWindow(), AppConst.W_MENU);
            OMY.Omy.viewManager.regWO(new CalcWindow(), AppConst.W_CALC);
        }

        this._fadeMainSound = false;
        super.showGame();
    }

    continueNewSession() {
        if (!this._fadeMainSound && !this._winMusic) this._resetTimerBg();
        return super.continueNewSession();
    }

    /**     * @private     */
    _resetTimerBg() {
        this._timeNoActive?.destroy();
        this._timeNoActive = OMY.Omy.add.timer(4, this._downBgTheme, this);
    }

    /**     * @private     */
    _downBgTheme() {
        OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 1, .2);
        this._timeNoActive?.destroy();
        this._fadeMainSound = true;
        this._timeNoActive = null;
    }

    /**     * @private     */
    _resetTimerWin() {
        this._timeWin?.destroy();
        this._timeWin = OMY.Omy.add.timer(30, this._offWinMusic, this);
    }

    /**     * @private     */
    _offWinMusic() {
        const time = AppG.gameConst.game_const["main_time_no_active"];
        OMY.Omy.sound.fadeTo(GameConstStatic.S_bg, time, 0);
        OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, time, 1);
        this._timeWin?.destroy();
        this._winMusic = false;
        this._fadeMainSound = false;
        this._resetTimerBg();
    }

    spinGame() {
        if (this._timeNoActive) {
            this._timeNoActive.destroy();
            this._timeNoActive = null;
        }
        super.spinGame();
        if (OMY.Omy.sound.isSoundPlay(GameConstStatic.S_bg_rs) && this._fadeMainSound && !this._winMusic) {
            this._fadeMainSound = false;
            OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 1, 1);
        }
    }

    lose() {
        super.lose();
    }

    showAllWinCombo() {
        if (AppG.beginBonusGame) {
            this._mainView._startBonusGame();
            return;
        }
        if (this._gameWithFree && AppG.beginFreeGame) this._mainView.hideWin();
        super.showAllWinCombo();
        if (AppG.isEndFree) this._mainView.startLoopAnimation(true);
        if (AppG.winCoef >= 5) {
            this._resetTimerWin();
            if (!this._winMusic) {
                if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_bg))
                    OMY.Omy.sound.play(GameConstStatic.S_game_bg, true);
                this._winMusic = true;
                OMY.Omy.sound.fadeTo(GameConstStatic.S_bg, 1, 1);
                OMY.Omy.sound.fadeTo(GameConstStatic.S_bg_rs, 0.3, 0);

                this._timeNoActive?.destroy();
                this._timeNoActive = null;
                this._fadeMainSound = true;
            }
        }
    }

    endShowWild() {
        super.gameOver();
    }

    gameOver() {
        if (AppG.serverWork.haveWild) {
            this._mainView.randomWild();
        } else {
            this.endShowWild();
        }
    }

    continueGameOver() {
        super.continueGameOver();
    }

    collectWin(fast = false) {
        OMY.Omy.sound.stop(GameConstStatic.S_gamble_wait);
        super.collectWin(fast);
    }

    _showFreeInFree() {
        this._mainView.freeInFree();
    }
}

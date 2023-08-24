import {AppG} from "../../../casino/AppG";
import {AppConst} from "../../../casino/AppConst";
import {BtnHome} from "../../../casino/display/buttons/BtnHome";
import {GuiBase} from "../../../casino/gui/GuiBase";
import {BtnAudioMobile} from "../../../casino/display/buttons/desktop/settings/BtnAudioMobile";
import {BtnMenuWindow} from "../../../casino/display/buttons/mobile/BtnMenuWindow";
import {BtnBetWindow} from "../../../casino/display/buttons/mobile/BtnBetWindow";
import {BtnStartSkipMobile} from "../../../casino/display/buttons/mobile/BtnStartSkipMobile";
import {GameConstStatic} from "../../GameConstStatic";
import {BStart} from "../../display/buttons/BStart";
import {InfoLineBase} from "../../game/kingofthering/InfoLineBase";

export class GuiMobile extends GuiBase {
    constructor() {
        super();
        AppG.emit.once(GameConstStatic.HIDE_GUI, this._hideGui, this);
        AppG.emit.once(GameConstStatic.SHOW_GUI, this._showGui, this);
        this.parentGroup = AppG.stage.gui;
    }

    _showGui() {
        this.visible = true
        this.alpha = 0;
        OMY.Omy.add.tween(this, {alpha: 1}, 1);
    }

    _hideGui() {
        this.visible = false
    }

    _createGraphic() {
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDGui");
        if (this._gdConf["entities"]) {
            for (let i = 0; i < this._gdConf["entities"].length; i++) {
                let conf = this._gdConf["entities"][i];
                if (!AppG.isHaveJackpot && conf.hasOwnProperty("jpContent")
                    && conf["jpContent"] === true) conf["active"] = false;
            }
        }
        OMY.Omy.add.createEntities(this, this._gdConf);
        if (this.getChildByName("info_line")) this._infoLine = new InfoLineBase(this.getChildByName("info_line"));
        if (this.getChildByName("info_line_v")) this._infoLineV = new InfoLineBase(this.getChildByName("info_line_v"));

        this.getChildByName("s_bar_side1").saveW = this.getChildByName("s_bar_side1").width;
        this.getChildByName("s_bar_side2").saveW = this.getChildByName("s_bar_side2").width;

        /** @type {OMY.OGraphic} */
        this._tint = this.getChildByName("r_tint");
        if (this._tint) {
            this._tint.visible = false;
            this._tint.interactive = true;
            AppG.emit.on(GameConstStatic.WIN_MESSAGE_BIG, this._onWinTintShow, this);
            AppG.emit.on(GameConstStatic.WIN_MESSAGE_HIDE, this._onWinTintHide, this);
        }

        this._createButtons();
        this._createTexts();

        super._createGraphic();
        this._updateGameSize();
    }

    _updateGameSize() {
        super._updateGameSize();

        this.getChildByName("s_bar_side2").width = this.getChildByName("s_bar_side2").saveW + AppG.dx;
        this.getChildByName("s_bar_side1").width = this.getChildByName("s_bar_side1").saveW + AppG.dx;

        this.getChildByName("s_panel_header").width = OMY.Omy.WIDTH;
        this.getChildByName("s_buttom").width = OMY.Omy.WIDTH;

        if (this._tint) {
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
            this._tint.x = -this.x;
            this._tint.y = -this.y;
        }
    }

    /**     * @public     */
    _createTexts() {
        super._createTexts();
        /** @type {OMY.OContainer} */
        let container;
        if (this.getChildByName("t_one_bet")) {
            container = this.getChildByName("t_one_bet");
            /** @type {OMY.OTextNumberBitmap} */
            this._txtOneBet = container.canvas.getChildByName("t_value");
            this._txtOneBet.lastText = AppG.currency;
            this._txtOneBet.showCent = true;
            this._txtOneBet.addTextUpdate(container.alignContainer, container);
            container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        }

        if (this.getChildByName("t_line")) {
            container = this.getChildByName("t_line");
            /** @type {OMY.OTextNumberBitmap} */
            this._txtLines = container.canvas.getChildByName("t_value");
            this._txtLines.showCent = false;
            this._txtLines.addTextUpdate(container.alignContainer, container);
            container.canvas.getChildByName("t_label").addTextUpdate(container.alignContainer, container);
        }

        this.updateWin();
        this.updateBalance();
        this.updateBet();
    }

    /**     * @public     */
    _createButtons() {
        this._btnStart = new BStart(this.getChildByName("b_start"));

        super._createButtons();

        if (AppG.isHaveSkip)
            new BtnStartSkipMobile(this.getChildByName("b_stop"));
        else
            this.getChildByName("b_stop").destroy();
        new BtnMenuWindow(this.getChildByName("b_menu"));
        new BtnBetWindow(this.getChildByName("b_bet"));
        new BtnHome(this.getChildByName("b_home"));
        new BtnAudioMobile(this.getChildByName("b_audio"));
    }

    updateBalance() {
        super.updateBalance();
    }

    updateBet() {
        super.updateBet();
        this._txtOneBet?.setNumbers(AppG.serverWork.currBet);
        this._txtLines?.setNumbers(AppG.serverWork.currLines);
    }

    _updateOnWin(value, skip = false) {
        if (AppG.isPLayReSpins) return;
        super._updateOnWin(value, skip);
    }

    /** @private */
    _onCreateWindow(wName) {
        switch (wName) {
            case AppConst.W_INTRO: {
                this.alpha = 0;
                break;
            }
            case AppConst.W_FREE_IN_FREE:
            case AppConst.W_FREE_GAME_END:
            case AppConst.W_FREE_GAME_BEGIN: {
                this._txtWin.setNumbers(0);
                break;
            }
        }
    }

    /** @private */
    _onRemoveWindow(wName) {
        switch (wName) {
            case AppConst.W_BONUS: {
                // this._panelWin.visible = true;
                // this._textWin.visible = true;
                // this.getChildByName("c_win_block").visible = true;
                // this.getChildByName("t_win_tittle").visible = true;
                // this.getChildByName("s_panel_win").visible = true;
                break;
            }
        }
    }

    /**     * @private     */
    _onWinTintShow() {
        this._tint.visible = true;
        this._tint.alpha = 0;
        OMY.Omy.add.tween(this._tint, {alpha: 1}, 0.3);
    }

    /**     * @private     */
    _onWinTintHide() {
        OMY.Omy.add.tween(this._tint, {alpha: 0}, 0.3, this._onHideTint.bind(this));
    }

    /**     * @private     */
    _onHideTint() {
        this._tint.visible = false;
    }
}

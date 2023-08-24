import {WindowsBase} from "../../casino/gui/WindowsBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";

export class IntroWindow extends WindowsBase {
    constructor() {
        super();

        this._wName = AppConst.W_INTRO;
        this.json = this._gdConf = OMY.Omy.assets.getJSON("GDIntro");

        this._isGraphic = false;
        this._isOpen = false;
        this.setXY(this._gdConf["x"], this._gdConf["y"]);

        if (this._gdConf["debug"] || this._gdConf["visible"]) {
            if (this._gdConf["debug"])
                OMY.Omy.add.regDebugMode(this);
            OMY.Omy.add.timer(0.5, this._showDebug, this);
        } else {
            this.kill();
        }
        OMY.Omy.viewManager.addCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.addDestroyWindow(this._onWindowClose, this);
        AppG.sizeEmmit.on(AppConst.EMIT_RESIZE, this._updateGameSize, this);
    }

    _updateGameSize() {
        if (!this.active) return;
        AppG.updateGameSize(this);

        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
    }

    revive(onComplete = null) {
        super.revive(onComplete);
        this._createGraphic();
    }

    _createGraphic() {
        if (this._isGraphic) return;
        this._isGraphic = true;
        OMY.Omy.add.createEntities(this, this._gdConf);

        /** @type {OMY.OActorSpine} */
        this._actorLogo = this.getChildByName("a_logo_intro");
        this._actorLogo.addComplete(this._start2Close, this, true);

        /** @type {OMY.OSprite} */
        this._tint = this.getChildByName("tint");

        this._updateGameSize();

        this._actorLogo.alpha = 0;
        this._actorLogo.gotoAndStop(0);
    }

    _onRevive() {
        super._onRevive();
        OMY.Omy.sound.play(GameConstStatic.S_intro_ambience);
        OMY.Omy.add.tween(this._actorLogo, {alpha: 1}, this._gdConf["tween_alpha_time"], this._onPlayIntro.bind(this));
    }

    /**     * @private     */
    _onPlayIntro() {
        this._actorLogo.gotoAndPlay(0, false);
        if (!OMY.Omy.sound.isSoundPlay(GameConstStatic.S_intro))
            OMY.Omy.sound.play(GameConstStatic.S_intro);
    }

    kill(onComplete = null) {
        if (this._isGraphic) {
            this._isOpen = false;
        }
        super.kill(onComplete);
    }

    _clearGraphic() {
        if (!this._isGraphic) return;

        AppG.sizeEmmit.off(AppConst.EMIT_RESIZE, this._updateGameSize, this);
        OMY.Omy.viewManager.removeCreateWindow(this._onWindowCreate, this);
        OMY.Omy.viewManager.removeDestroyWindow(this._onWindowClose, this);
        this._isGraphic = false;
        this._actorLogo = null;
        this._tint = null;

        this.callAll("destroy");
    }

    _onKill() {
        if (this._isGraphic) {
            this._clearGraphic();
        }
        super._onKill();
    }

    /**     * @private     */
    _start2Close() {
        OMY.Omy.add.timer(this._gdConf["delay_logo"], this._onClose, this);
    }

    _onClose() {
        OMY.Omy.add.tween(this, {alpha: 0}, this._gdConf["time_alpha_intro"]);
        AppG.emit.emit(GameConstStatic.SHOW_GUI);
        OMY.Omy.add.timer(this._gdConf["time_alpha_intro"] + .2, () => {
            OMY.Omy.viewManager.hideWindow(this._wName);
        }, this);
    }

    _onWindowCreate(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = false;
        }
    }

    _onWindowClose(window) {
        if (!this._isGraphic) return;
        if (window === AppConst.W_WARNING) {
            // if (this._tint)
            //     this._tint.interactive = true;
        }
    }
}

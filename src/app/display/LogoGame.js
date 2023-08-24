import {LogoGameBase} from "../../casino/display/LogoGameBase";
import {AppConst} from "../../casino/AppConst";
import {AppG} from "../../casino/AppG";

export class LogoGame extends LogoGameBase {
    constructor(graphic) {
        super(graphic);

        /** @type {OMY.OActorSpine} */
        this._aSpine = this._graphic.getChildByName("a_Logo");
        AppG.emit.on(AppConst.EMIT_WIN, this._playWinEffect, this);
    }

    /**     * @private     */
    _playWinEffect() {
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["a_win"]);
        this._aSpine.addComplete(this._showStaticLogo, this, true);
    }

    /**     * @private     */
    _showStaticLogo() {
        this._aSpine.gotoAndPlay(0, false, this._aSpine.json["custom_a_name"]);
    }
}

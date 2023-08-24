import {PaytableWindowBase} from "../../casino/gui/windows/PaytableWindowBase";
import {PaytablePage} from "./windows/paytable/PaytablePage";

export class PaytableWindow extends PaytableWindowBase {
    constructor() {
        super();
        this._pageClass = PaytablePage;
    }

    _createGraphic() {
        if (this._isGraphic) return;
        super._createGraphic();
        this._tint = this.getChildByName("s_tint");
        this._updateGameSize();
    }

    _clearGraphic() {
        if (!this._isGraphic) return;
        this._tint = null;
        super._clearGraphic();
    }

    _updateGameSize() {
        if (!this.active) return;
        if (this._tint) {
            this._tint.x = -this.x;
            this._tint.y = -this.y;
            this._tint.width = OMY.Omy.WIDTH;
            this._tint.height = OMY.Omy.HEIGHT;
        }
        super._updateGameSize();
    }

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    _onRevive() {
        super._onRevive();
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    _onKill() {
        super._onKill();
    }
}

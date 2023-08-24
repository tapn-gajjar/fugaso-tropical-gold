import {ReelBase} from "../../../casino/display/reels/ReelBase";
import {AppG} from "../../../casino/AppG";

export class Reel extends ReelBase {
    constructor(conf, index, initCombination) {
        super(conf, index, initCombination);

        this._timeForLongReel = AppG.gameConst.getData("timeForLongReel");
        this._stoppingMoveSpeed = AppG.gameConst.getData("stoppingMoveSpeed");
    }

    createSymbols() {
        if (AppG.serverWork.recoverSantas) {
            const list = AppG.serverWork.holdList[this.index] || [];
            for (let i = 0; i < list.length; i++) {
                if (list[i] === 1) this.initCombination[i] = "H";
            }
        }
        super.createSymbols();
    }

    stopMoveSpeed() {
        if (this.deaccelerationTween) {
            this.deaccelerationTween.kill();
            this.deaccelerationTween = null;
        }

        this.deaccelerationTween = OMY.Omy.add.tween(this,
            {speed: this.otherVector * this._stoppingMoveSpeed}, this._timeForLongReel);

    }
}

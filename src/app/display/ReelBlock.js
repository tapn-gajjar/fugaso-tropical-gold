import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";
import {AppConst} from "../../casino/AppConst";
import {ReelBlockBase} from "../../casino/display/reels/ReelBlockBase";

export class ReelBlock extends ReelBlockBase {
    constructor() {
        super();
        AppG.emit.on(AppConst.APP_EMIT_CATCH_SCATTER, this._onCatchScatter, this);
        this._countWild = 0;
        // this._minNotWild = AppG.gameConst.game_const["count_not_wild"][0];
        // this._maxNotWild = AppG.gameConst.game_const["count_not_wild"][1];
    }

    _createReels() {
        super._createReels();
        if (AppG.serverWork.haveWild) this.addWild();
        for (let i = 0; i < this._activeList.length; i++) {
            for (let j = 0; j < this._activeList[i].length; j++) {
                if (this._activeList[i][j].symbolName === "H")
                    this._activeList[i][j].recoverWild();
                else if (this._activeList[i][j].symbolName === "F" || this._activeList[i][j].symbolName === "G")
                    this._activeList[i][j].recoverIdleEffect();
            }
        }
    }

    start() {
        this._longMatrix = null;
        this._countWild = 0;
        // if (!SlotSymbol.countNotWild) SlotSymbol.countNotWild = [0, 0, 0, 0, 0];
        // SlotSymbol.countNotWild.map((a, index, array) =>
        //     array[index] = OMY.OMath.randomRangeInt(this._minNotWild, this._maxNotWild));
        super.start();
    }

    _onTurboPreEase(reelId) {
        OMY.Omy.sound.play(((AppG.delayDelayBetweenReelsTimeCoef) ? GameConstStatic.S_reel_stop : GameConstStatic.S_reel_stop_all));
        super._onTurboPreEase(reelId);
        /* if (this._checkReelBySymbol(reelId, ["A"]) && !OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_drop)) {
             OMY.Omy.sound.stop(GameConstStatic.S_reel_stop);
             OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
         }*/
    }

    _onNormalPreEase(reelId) {
        super._onNormalPreEase(reelId);
        /*if (this._checkReelBySymbol(reelId, ["A"])) {
            OMY.Omy.sound.stop(GameConstStatic.S_reel_stop);
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
        }*/
    }

    _onNormalSkipPreEase(reelId) {
        super._onNormalSkipPreEase(reelId);
        /*if (this._checkReelBySymbol(reelId, ["A"]) && !OMY.Omy.sound.isSoundPlay(GameConstStatic.S_wild_drop)) {
            OMY.Omy.sound.play(GameConstStatic.S_wild_drop);
        }*/
    }

    /*_checkScatterPreEase(reelId) {
        if (AppG.gameConst.getData("scatterSymbol").indexOf(this._activeList[reelId][1].symbolName) !== -1 &&
            reelId === this._countScatters) {
            this._countScatters++;
            this._scatterInReal = true;
            OMY.Omy.sound.play(GameConstStatic["S_reel_scatter" + String(this._countScatters)]);

            for (let j = 0; j < this._countSlot; j++) {
                if (AppG.gameConst.getData("scatterSymbol").indexOf(this._activeList[reelId][j].symbolName) !== -1) {
                    OMY.Omy.add.tween(this._activeList[reelId][j].scale, {
                        x: 1.1,
                        y: 1.1,
                        yoyo: true,
                        repeat: 1,
                    }, 0.2);
                }
            }
        }
    }*/

    /*_checkScatterPreEase(reelId) {
        super._checkScatterPreEase(reelId);
        this._checkWildOnReel(reelId);
    }*/

    /*_checkScatter(reelId) {
        if (AppG.skipped) this._checkWildOnReel(reelId);
    }*/

    /*/!**     * @private     *!/
    _checkWildOnReel(reelId) {
        if (this._checkReelBySymbol(reelId, "A")) {
            this._countWild++;
            this._ease = OMY.Omy.Ease.add(this, this._gdConf["shake"], this._gdConf["shake_option"]);
            this._ease.once('complete', this._endShake, this);

            this._countWild = (this._countWild >= 3) ? this._countWild : this._countWild;
            OMY.Omy.sound.play(GameConstStatic["S_wild_drop" + String(this._countWild)]);
        }
    }*/

    /*/!**     * @private     *!/
    _endShake() {
        this.setXY(
            this._gdConf.x,
            this._gdConf.y,
        );
    }*/

    /**     * @private     */
    _onCatchScatter(count, reelId) {
        let needPlay = true;
        if (count === 1 && reelId >= 3) needPlay = false;
        if (count === 2 && reelId > 3) needPlay = false;
        if (needPlay)
            OMY.Omy.sound.play(GameConstStatic["S_reel_scatter" + String(count)]);
    }

    respinLongEffect(longMatrix) {
        this._longMatrix = longMatrix;
    }

    _checkLongReelCase() {
        if (this._longMatrix) {
            let effectIndex = -1;
            let timeForLongReel = 0;
            let timeDelay = this._delayDelayBetweenReelsTime *
                ((this._turboMode) ? this._delayDelayBetweenReelsTimeCoef : 1);
            for (let i = 0; i < this._longMatrix.length; i++) {
                this._reelList[i].effectIndex = -1;
                if (Boolean(this._longMatrix[i])) {
                    this._reelList[effectIndex].effectIndex = (i === this._longMatrix.length - 1) ? -1 : i;
                    timeForLongReel += (i === this._longMatrix.length - 1) ? timeDelay : this._timeForLongReel;
                    this._reelList[i].longReel(timeForLongReel, false, "A");
                }
                if (!this._reelList[i].isBlock) effectIndex = i;
            }
            this._longMatrix = null;
        }
    }

    addWild() {
        this._activeList[1][1].change2Wild();
    }
}

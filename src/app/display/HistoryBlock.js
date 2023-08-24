import {HistoryBlockBase} from "../../casino/display/gui/HistoryBlockBase";
import {AppG} from "../../casino/AppG";
import {GameConstStatic} from "../GameConstStatic";

export class HistoryBlock extends HistoryBlockBase {
    constructor(soundBtn = null) {
        super(soundBtn);
    }

    /**
     * Draw win symbols at history view block
     * @param {HistoryActionData} data
     */
    _drawSymbols(data) {
        let stopList = data.stopList;
        if (!stopList || !stopList.length) {
            return;
        }

        let category = data.category;
        let serverData = data.rawData;
        let totalReel = AppG.totalReel;
        let countSlot = AppG.gameConst.countSlot;
        let symbolWidth = this._gdConf["symbolWidth"] || AppG.gameConst.symbolWidth;
        let symbolHeight = this._gdConf["symbolHeight"] || AppG.gameConst.symbolHeight;
        let reels = AppG.serverWork.getReelsByCategory(category);

        let minHeight = this._gdConf["min_height"];
        let scaleConfig = this._gdConf["symbol_scale"] || {};
        for (let i = 0; i < totalReel; i++) {
            let reel = reels[i];
            let stopIndex = stopList[i];
            for (let j = 0; j < countSlot; j++) {
                let symbolKey = reel.charAtExt(stopIndex + j);
                if (serverData.special?.feature === "W" && i === 1 && j === 1)
                    symbolKey = "H";
                let symbolIndex = AppG.gameConst.symbolID(symbolKey);
                /** @type {OMY.OSprite} */
                let symbol = OMY.Omy.add.spriteJson(this._view.canvas, this._gdConf["symbol"]);
                symbol.texture = this._gdConf["texture"] + String(symbolIndex);
                symbol.x = i * (symbolWidth + symbol.json.dx);
                symbol.y = j * symbolHeight;
                symbol.name = "s_" + String(i) + "_" + String(j);
                symbol.userData = symbolKey;

                if (scaleConfig[symbolKey]) {
                    symbol.scale.set(scaleConfig[symbolKey]);
                } else if (minHeight) {
                    let sHeight = symbol.height;
                    symbol.height = minHeight;
                    symbol.scaleX = minHeight / sHeight;
                }
            }
        }
        this._view.alignContainer();
    }

    /**     * @private     */
    _clearWheel() {
        // if (this._wheel?.parent)
        //     this._view.removeChild(this._wheel);
    }

    _onActionOverHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_over_on);
        super._onActionOverHandler();
    }

    _onActionHandler(item) {
        this._clearWheel();
        return super._onActionHandler(item);
    }

    _onItemOverHandler() {
        OMY.Omy.sound.play(GameConstStatic.S_btn_over_on);
        super._onItemOverHandler();
    }

    _onItemHandler(item) {
        this._clearWheel();
        return super._onItemHandler(item);
    }

    _onCloseHandler() {
        this._clearWheel();
        super._onCloseHandler();
    }

    kill() {
        this._clearWheel();
        super.kill();
    }

//---------------------------------------
/// ACCESSOR
//---------------------------------------
}

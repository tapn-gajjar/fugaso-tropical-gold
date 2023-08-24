export class LineInGame {
    constructor(graphic, activeSymbolList) {
        this._graphic = graphic;
        this._gdConf = graphic.json;
        this._winAnimation = false;
    }

    show() {
    }

    hide() {
    }

    showWinAnimation() {
        if (this._winAnimation) return;
        this._winAnimation = true;
        this._particles.reset();
    }

    hideWinEffect() {
        if (!this._winAnimation) return;
        this._winAnimation = false;
        this._particles.reset();
    }

    showWinLine(valueLine, clear = true, animNumber = false) {
        if (clear) this._particles.reset();
        this._particles.play(this._particles.json["lines"][valueLine]);
    }

    showWinLineScatter() {
    }

    _clearLines() {
    }

    /**     * @private     */
    _debugWinLine() {
        this.showWinAnimation();
        for (let i = 0; i < this._particles.json["lines"].length; i++) {
            this._particles.play(this._particles.json["lines"][i]);
        }
    }

    set linesGraphic(value) {
        /** @type {OMY.OContainer} */
        this._winLine = value;
        /** @type {OMY.ONeutrinoParticles} */
        this._particles = value.getChildByName("np_win_lines");
        Boolean(this._winLine.json["debug_line"]) && this._debugWinLine();
    }
}

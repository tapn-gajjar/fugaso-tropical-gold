import {PaytablePageBase} from "../../../../casino/gui/windows/paytable/PaytablePageBase";
import {AppG} from "../../../../casino/AppG";

export class PaytablePage extends PaytablePageBase {
    constructor(gd) {
        super(gd);
        this._spriteLocList = [];
     
        this._title_container = this.getChildByName("c_paytable_title");  
        this._title = this._title_container?.canvas.getChildByName("s_paytable_title");    
        this._spriteLocList.push(this._title);
  
        this._win_up_to_left_container = this.getChildByName("c_paytable_win_up_to");
        this._win_up_to_left = this._win_up_to_left_container?.canvas.getChildByName("s_paytable_win_up_to");
        this._spriteLocList.push(this._win_up_to_left);
     
        this._win_up_to_right_container = this.getChildByName("c_paytable_win_up_to_right");
        this._win_up_to_right = this._win_up_to_right_container?.canvas.getChildByName("s_paytable_win_up_to_right");
        this._spriteLocList.push(this._win_up_to_right);

        this._win_up_to_left_container_p2 = this.getChildByName("c_paytable_win_up_to_p2");
        this._win_up_to_left_p2 = this._win_up_to_left_container_p2?.canvas.getChildByName("s_paytable_win_up_to");
        this._spriteLocList.push(this._win_up_to_left_p2);
     
        this._win_up_to_right_container_p2 = this.getChildByName("c_paytable_win_up_to_right_p2");
        this._win_up_to_right_p2 = this._win_up_to_right_container_p2?.canvas.getChildByName("s_paytable_win_up_to_right");
        this._spriteLocList.push(this._win_up_to_right_p2);

        /** @type {OMY.OContainer} */
        this._animLayer = (this.getChildByName("c_animLayer")) ? this.getChildByName("c_animLayer") : this;
        /** @type {OMY.OSprite} */
        this._titleBg = this.getChildByName("s_pt_title_shadow");
        /** @type {OMY.OTextBitmap} */
        this._tLabel = this.getChildByName("t_label");

        OMY.Omy.loc.addUpdate(this._onLocChange, this);
        this._onLocChange();
        
    }

    
    /**     * @private     */
    _onLocChange() {        
        for (let i = 0; i < this._spriteLocList.length; i++) {
            if(this._spriteLocList[i]){
                let sprite = this._spriteLocList[i];
                for (let key in sprite.json["locTexture"]) {
                    if (OMY.OMath.inArray(sprite.json["locTexture"][key], AppG.language)) {
                        sprite.texture = sprite.json["locTexture"][key];
                        break;
                    }
                }
            }            
        }

        this._title_container?.alignContainer();
        this._win_up_to_left_container?.alignContainer();
        this._win_up_to_right_container?.alignContainer();
        this._win_up_to_left_container_p2?.alignContainer();
        this._win_up_to_right_container_p2?.alignContainer();
        
        if (this._titleBg && this._tLabel) this._titleBg.width = this._tLabel.width + 170;
    }

    revive() {
        super.revive();
        if (this.json["spine"]) {
            for (let i = 0; i < this.json["spine"].length; i++) {
                OMY.Omy.add.actorJson(this._animLayer, this.json["spine"][i]);
            }
        }
        this._isTween = true;

        if (this.json.hasOwnProperty("animate_symbols") && this.json["animate_symbols"]) {
            for (let i = 0; i < this._animLayer.children.length; i++) {
                this._animLayer.children[i].gotoAndStop(0);
            }
            this._startIndex = 0;
            this._animateSymbols();
        }

        if (this.json.hasOwnProperty("format_elements") && this.json["format_elements"]) OMY.Omy.add.formatObjectsByY(this);
    }

    kill() {
        this._timerDelay?.destroy();
        this._timerDelay = null;
        super.kill();
    }

    destroy(apt) {
        OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        this._spriteLocList.length = 0;
        this._spriteLocList = null;
        this._timerDelay?.destroy();
        this._timerDelay = null;
        this._animLayer = null;
        this._title_container = null;
        this._win_up_to_left_container = null;
        this._win_up_to_right_container = null;
        this._win_up_to_left_container_p2 = null;
        this._win_up_to_right_container_p2 = null;        
        this._titleBg = null;
        this._tLabel = null;
        super.destroy(apt);
    }

    _updateBet() {
        super._updateBet();
    }

    // region : symbols
    //-------------------------------------------------------------------------
    /**     * @private     */
    _animateSymbols() {
        /** @type {OMY.OActorSpine} */
        let actor = this._animLayer.children[this._startIndex];

        if (++this._startIndex >= this._animLayer.children.length) this._startIndex = 0;
        actor.play();
        actor.addComplete(this._delayStartNextSymb, this, true);
    }

    /**     * @private     */
    _delayStartNextSymb(actor) {
        this._timerDelay = OMY.Omy.add.timer(actor.json["delay"], this._animateSymbols, this);
    }

    //-------------------------------------------------------------------------
    //endregion
}

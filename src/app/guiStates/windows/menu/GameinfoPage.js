import {GameinfoPageBase} from "../../../../casino/gui/windows/menu/GameinfoPageBase";
import {AppG} from "../../../../casino/AppG";

export class GameinfoPage extends GameinfoPageBase {
    constructor(source) {
        super(source);
        /*this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render_land1"));
        this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render_land2"));
        this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render_port1"));
        this._renderLines(source.getChildByName("c_page_content")
            .getChildByName("c_lines").getChildByName("c_lines_render_port2"));*/


        this._spriteLocList = [];

        
        this._win_up_to_left_container = source.getChildByName("c_page_content").getChildByName("c_group_2").getChildByName("c_paytable_win_up_to");
        this._win_up_to_left = this._win_up_to_left_container?.canvas.getChildByName("s_paytable_win_up_to");
        this._spriteLocList.push(this._win_up_to_left);
     
        this._win_up_to_right_container = source.getChildByName("c_page_content").getChildByName("c_group_2").getChildByName("c_paytable_win_up_to_right");
        this._win_up_to_right = this._win_up_to_right_container?.canvas.getChildByName("s_paytable_win_up_to_right");
        this._spriteLocList.push(this._win_up_to_right);

        OMY.Omy.loc.addUpdate(this._onLocChange, this);
        this._onLocChange();
    }

    _onCheckGraphic() {
        super._onCheckGraphic();

        // if (this._spriteLocList.length) {
        //     OMY.Omy.loc.addUpdate(this._onLocChange, this);
        //     this._onLocChange();
        // }
    }

    /**     * @private     */
    _onLocChange() {
        for (let i = 0; i < this._spriteLocList.length; i++) {
            if(this._spriteLocList[i]){
                let sprite = this._spriteLocList[i];
                for (let key in sprite.json["locTexture"]) {
                    if (key.indexOf(OMY.Omy.language) > -1) {
                        sprite.texture = sprite.json["locTexture"][key];
                        break;
                    }
                }
                
            }
        }

        this._win_up_to_left_container?.alignContainer();
        this._win_up_to_right_container?.alignContainer();
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    destroy() {
        if (this._spriteLocList.length) {
            OMY.Omy.loc.removeUpdate(this._onLocChange, this);
        }
        this._spriteLocList.length = 0;
        this._spriteLocList = null;
        super.destroy();
    }

    //-------------------------------------------------------------------------
    // ACCESSOR
    //-------------------------------------------------------------------------
}

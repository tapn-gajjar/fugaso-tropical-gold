import {MenuBaseWindow} from "../../casino/gui/windows/MenuBaseWindow";

export class MenuWindow extends MenuBaseWindow {
    constructor() {
        super();
    }

    //-------------------------------------------------------------------------
    // PUBLIC
    //-------------------------------------------------------------------------

    revive(onComplete = null) {
        super.revive(onComplete);
    }

    kill(onComplete = null) {
        super.kill(onComplete);
    }

    //-------------------------------------------------------------------------
    // PRIVATE
    //-------------------------------------------------------------------------
}

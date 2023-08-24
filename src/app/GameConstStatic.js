export const GameConstStatic = {
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,

    DESK_WIDTH: 1280,
    DESK_HEIGHT: 720,

    MOB_WIDTH: 1280,
    MOB_HEIGHT: 720,
    MOB_WIDTH_V: 540,
    MOB_HEIGHT_V: 960,

    SYMBOL_ON_REEL: "symbol_on_reel",
    HIDE_GUI: "hide_GUI",
    SHOW_GUI: "show_GUI",

    S_btn_any: "btn_any",
    S_button_menu: "btn_any",
    S_btn_bet_minus: "btn_any",
    S_btn_bet_plus: "btn_any",
    S_take_take: "take-take",
    S_take_end: "sk_take take END",
    S_btn_bet_max: "btn_any",
    S_btn_reveal: "btn_start",
    S_btn_disable: "btn_any",
    S_btn_auto_off: "btn_any",
    S_btn_auto_on: "btn_any",
    S_btn_over_on: "btn_over",

    S_leaf_information: "leaf_information",

    S_reel_bg: "reel_move",
    S_reel_stop: "reel_stop",
    S_reel_stop_all: "quick_stop",
    S_quickStop: "quick_stop",

    S_show_win: () => {
        return "win_symbol_" + String(OMY.OMath.randomRangeInt(1, 2));
    },
    S_loop_win: "tg_win_line_symbol",
    S_win_line_1: "tg_win_line_",

    S_game_bg: "",
    S_bg: "tg_main",
    S_bg_rs: "tg_main_down",
    S_bg_fg: "",
    S_fg_end: "tg_end_free_spin",
    S_fg_start: "start free spin 4+",
    S_fg_start2: "start_free_spin 1-3",
    S_fg_sound: "",
    S_fg_in_free: "",
    S_intro: "tg_intro",
    S_bg_win: "",

    S_wheel_bg: "",
    S_bg_bonus: "",
    S_bonus_end: "",
    S_bonus_pick: "",

    S_intro_ambience: "",
    S_show_reel: "show_reel",

    S_paytable_open: "tg_btn_open_paytable",
    S_help_close: "tg_btn_close_paytable",

    S_wild_drop: "wild_on_reel",
    S_wild_wait: "",
    S_fly_coins: "",
    S_show_wild: "tg_sultan_appearance",
    S_wild_shake: "",

    S_gamble_wait: "",
    S_gamble_choice: "",
    S_gamble_tick: "",
    S_gamble_win: "",
    S_gamble_lose: "",
    S_gamble_super_win: "",

    S_JPWin: "JPWin",

    S_reel_scatter1: "",
    S_reel_scatter2: "",
    S_reel_scatter3: "",
    S_reel_scatter4: "",
    S_reel_scatter5: "",
    S_scatter_wait: "",

    S_cash: "cash",
    S_big_win_END: "big_mega_epic_win_end",
    S_big_win_show: "big_win",
    S_mega_win_show: "mega_win",
    S_epic_win_show: "epic_win",
    S_start_big_win_effect: "tg_ovation",
    S_pop_up_poster: "pop_up_poster",
    S_multi_move:"ak_multiplierrising",

    WIN_MESSAGE_SHOW: "WIN_MESSAGE_SHOW",
    WIN_MESSAGE_HIDE: "WIN_MESSAGE_HIDE",
    WIN_MESSAGE_BIG: "WIN_MESSAGE_BIG",
    WIN_MESSAGE_MEGA: "WIN_MESSAGE_MEGA",
    WIN_MESSAGE_EPIC: "WIN_MESSAGE_EPIC",

    E_WILD_ON_SCREEN: "E_WILD_ON_SCREEN",

    REEL_WIN_TINT_SHOW: "REEL_WIN_TINT_SHOW",
    REEL_WIN_TINT_HIDE: "REEL_WIN_TINT_SHOW",
};

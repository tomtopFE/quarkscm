/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'TT_font\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon_interpret': '&#xe967;',
		'icon_download': '&#xe964;',
		'icon_blog': '&#xe94e;',
		'icon_list_4': '&#xe966;',
		'icon_whouse': '&#xe965;',
		'icon_whouse_1': '&#xe960;',
		'icon_flash_d_2': '&#xe962;',
		'icon_new_arrivals': '&#xe963;',
		'icon_flash_d': '&#xe93a;',
		'icon_forum': '&#xe961;',
		'icon_bell': '&#xe907;',
		'icon_bell_c': '&#xe95f;',
		'icon_faq': '&#xe95d;',
		'icon_play': '&#xe95e;',
		'icon_Replies_f': '&#xe95b;',
		'icon_Views_f': '&#xe95c;',
		'icon_android': '&#xe955;',
		'icon_apple': '&#xe956;',
		'icon_chat_1': '&#xe957;',
		'icon_customer_service': '&#xe958;',
		'icon_time_1': '&#xe959;',
		'icon_tool_1': '&#xe95a;',
		'icon_cart_f': '&#xe953;',
		'icon_home_f': '&#xe954;',
		'icon_outdoor': '&#xe925;',
		'icon_smart_device': '&#xe952;',
		'icon_Bing': '&#xe950;',
		'icon_tumblr': '&#xe951;',
		'icon_multi_select': '&#xe94c;',
		'icon_notes': '&#xe94b;',
		'icon_cross_b': '&#xe94a;',
		'icon_checkbox_disable': '&#xe948;',
		'icon_delete': '&#xe949;',
		'icon_home': '&#xe940;',
		'icon_search': '&#xe93f;',
		'icon_cart': '&#xe90a;',
		'icon_editor': '&#xe90f;',
		'icon_currency': '&#xe93b;',
		'icon_choose': '&#xe902;',
		'icon_choose_no': '&#xe947;',
		'icon_bag': '&#xe905;',
		'icon_language': '&#xe93d;',
		'icon_delete2': '&#xe910;',
		'icon_signout': '&#xe917;',
		'icon_review': '&#xe920;',
		'icon_myaccount': '&#xe92f;',
		'icon_wishlists': '&#xe938;',
		'icon_wishlist': '&#xe93c;',
		'icon_check': '&#xe941;',
		'icon_sidebar': '&#xe92e;',
		'icon_radio': '&#xe901;',
		'icon_radios': '&#xe942;',
		'icon_clock': '&#xe903;',
		'icon_checkbox': '&#xe90c;',
		'icon_checkboxs': '&#xe90d;',
		'icon_cog': '&#xe90e;',
		'icon_load': '&#xe93e;',
		'icon_list2': '&#xe91d;',
		'icon_dress': '&#xe911;',
		'icon_rc': '&#xe92a;',
		'icon_beauty': '&#xe906;',
		'icon_home_garden': '&#xe918;',
		'icon_pc': '&#xe926;',
		'icon_cellphone': '&#xe90b;',
		'icon_video': '&#xe936;',
		'icon_tool': '&#xe933;',
		'icon_game': '&#xe914;',
		'icon_light': '&#xe91a;',
		'icon_camera2': '&#xe908;',
		'icon_music': '&#xe921;',
		'icon_car': '&#xe909;',
		'icon_list': '&#xe91c;',
		'icon_grid': '&#xe916;',
		'icon_filter': '&#xe913;',
		'icon_share': '&#xe92d;',
		'icon_plus': '&#xe928;',
		'icon_minus': '&#xe922;',
		'icon_cross': '&#xe943;',
		'icon_left': '&#xe919;',
		'icon_right': '&#xe92b;',
		'icon_bottom': '&#xe945;',
		'icon_top': '&#xe946;',
		'icon_up': '&#xe904;',
		'icon_arr_bottom': '&#xe935;',
		'icon_lock': '&#xe91e;',
		'icon_mail': '&#xe91f;',
		'icon_order': '&#xe924;',
		'icon_point': '&#xe929;',
		'icon_no_content': '&#xe944;',
		'icon_sale': '&#xe92c;',
		'icon_one_star': '&#xe923;',
		'icon_stars': '&#xe930;',
		'icon_sure': '&#xe931;',
		'icon_tag': '&#xe932;',
		'icon_google_plus': '&#xe915;',
		'icon_pinterest': '&#xe927;',
		'icon_vk': '&#xe937;',
		'icon_youtube': '&#xe939;',
		'icon_youtube_1': '&#xe94f;',
		'icon_twitter': '&#xe934;',
		'icon_facebook': '&#xe912;',
		'icon_instagram': '&#xe900;',
		'icon_linkedin': '&#xe91b;',
		'icon_poly_vore': '&#xe94d;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon_[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());

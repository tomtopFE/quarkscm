$(document).ready(function(){
	currentBaseUrl = $(".currentBaseUrl").val();
	$(".top_currency .currency_list ul li").click(function(){
		currency = $(this).attr("rel");
		htmlobj=$.ajax({url:currentBaseUrl+"/cms/home/changecurrency?currency="+currency,async:false});
		//alert(htmlobj.responseText);
		location.reload() ;
	});
	$(".top_lang .store_lang").click(function(){
		//http = document.location.protocol+"://";
		currentStore = $(".current_lang").attr("rel");
		changeStore = $(this).attr("rel");
		currentUrl = window.location.href;
		redirectUrl = currentUrl.replace("://"+currentStore,"://"+changeStore);
		//alert(redirectUrl);
		//alert(2);
		location.href=redirectUrl;
	});
	
	// ajax get account login info
	
	loginInfoUrl = currentBaseUrl+"/customer/ajax";
	logoutUrl 	 = $(".logoutUrl").val();
	product_id   = $(".product_view_id").val();
	product_id	 = product_id ? product_id : null;
	jQuery.ajax({
		async:true,
		timeout: 6000,
		dataType: 'json', 
		type:'get',
		data: {
			'currentUrl':window.location.href,
			'product_id':product_id
		},
		url:loginInfoUrl,
		success:function(data, textStatus){ 
			// welcome = $('.welcome_str').val();
			// logoutStr = $('.logoutStr').val();
            var ele_resigter = $(".m_head_acount>.bm_dropdown>.dropdown_menu .sigin_c .signIn")
            var ele_login = $(".m_head_acount>.bm_dropdown>.dropdown_menu .sigin_c .acount_link")
			if(data.loginStatus){
			    $(".m_head_acount>.bm_dropdown>.dropdown_link>a").html(data.customer_name)
                //隐藏登陆注册部分
                ele_resigter.hide()
                //开启个人用户中心
                ele_login.show()
                // $(".m_head_acount>.bm_dropdown>.dropdown_link>a").html(data.customer_name)
				// customer_name = data.customer_name;
				// str = '<span id="welcome">'+welcome+' '+customer_name+',</span>';
				// str += '<span id="js_isNotLogin">';
				// str += '<a href="'+logoutUrl+'" rel="nofollow">'+logoutStr+'</a>';
				// str += '</span>';
				// $(".login-text").html(str);
			}
			// if(data.favorite){
			// 	$(".myFavorite_nohove").addClass("act");
			// 	$(".myFavorite_nohove a").addClass("act");
			// }
			// if(data.favorite_product_count){
			// 	$("#js_favour_num").html(data.favorite_product_count);
			// }
			// if(data.csrfName && data.csrfVal && data.product_id){
			// 	$(".product_csrf").attr("name",data.csrfName);
			// 	$(".product_csrf").val(data.csrfVal);
			// }
			if(data.cart_qty){
				$("#js_cart_items").html(data.cart_qty);
			}
			
			
		},
		error:function (XMLHttpRequest, textStatus, errorThrown){}
	});
	
	$("#goTop").click(function(){
		$("html,body").animate({scrollTop:0},"slow");
	});
	
	$("#goBottom").click(function(){
		var screenb = $(document).height(); 
								
		$("html,body").animate({scrollTop:screenb},"slow");
	});

	//顶部鼠标经过下拉
	$(document).on('mouseover','.top_lang,.top_currency',function () {
		$(this).find('i.icon_bottom').addClass('animate_rotate');
		$(this).children('.lang_list').show();
        $(this).children('.currency_list').show();

    })
    $(document).on('mouseout','.top_lang,.top_currency',function () {
        $(this).find('i.icon_bottom').removeClass('animate_rotate');
        $(this).children('.lang_list').hide();
        $(this).children('.currency_list').hide();
    })
	//产品盒子经过动画
    $(document).on('mouseover','.pro-content .item',function () {
		$(this).addClass('animate_transY');
	})
    $(document).on('mouseout','.pro-content .item',function () {
        $(this).removeClass('animate_transY');
    })

});

/*dropdown*/
;(function($){
    $.fn.dropdown=function(options){
		/*默认参数*/
        $.fn.dropdown.defaults = {
            trigger :'click'
        };
        var opts = $.extend({},$.fn.dropdown.defaults,options);
        if(opts.trigger == 'click'){
            var $parent = getParent(this),isOpen;
            isOpen = $parent.hasClass('openD');
            if(!isOpen){
                clearMenus();
                $parent.addClass('openD');
            }else{
                $parent.removeClass('openD');
            }
            // $parent.mouseleave(function(){
            //     clearMenus();
            // })//点击触发，也应该在鼠标移开的时候消失 by wxl
        }else if(opts.trigger == 'hover'){
            var that = this,timeOut;
            that.each(function() {
                var $this = $(this);
                var $parent = getParent($this);
                $parent.hover(function(){
                    clearTimeout(timeOut);
                    clearMenus();
                    $(this).addClass('openD');
                },function(){
                    var $current = $(this);
                    timeOut=setTimeout(function(){
                        $current.removeClass('openD');
                    },100);
                });
            });
        }
        function getParent(currentObj){
            var $parent = currentObj.parent();
            return $parent;
        }
        function clearMenus(){
            $("[data-toggle = dropdown]").each(function () {
                var $parent = getParent($(this));
                $parent.removeClass('openD');
            });
        }
    };
})(jQuery);
$(function(){
    document.cookie.indexOf("WEB-history") == "-1" ? $(".m_shopping_history").css('display','none') : $(".m_shopping_history").css('display','block');
    $(document).on("click",'.dropdown_click',function(e){
        $(this).dropdown({
            trigger:'click'
        });
        e.stopPropagation();
    });
    if ($('[data-toggle=dropdown]').hasClass('dropdown_hover')) {
        $('.dropdown_hover').dropdown({
            trigger:'hover'
        });
    }
    function clearMenus(){
        $("[data-toggle = dropdown]").each(function () {
            var $parent = $(this).parent();
            $parent.removeClass('openD')
        });
    }
    // $(document).on('click',function(e){
    // 	/*data-close有这个属性的不关闭弹窗*/
    // 	var notClose=$(e.target).attr('data-close');
    // 	if(!notClose){
    // 		clearMenus();
    // 	}
    // });//这里有问题 by wxl ,点击下拉层的任何位置都会关闭下拉层。
    $(document).on('click',function(e){
		/*data-close有这个属性的不关闭弹窗*/
        var notClose = $(e.target).hasClass('dropdown_menu') || $(e.target).attr('data-close')  ? $(e.target).attr('data-close') : $(e.target).parents('.dropdown_menu').attr('data-close') || $(e.target).hasClass('dlCart');
        if(!notClose){
            clearMenus();
        }
    });//修复 by wxl , 我觉得这个没必要了。应该是鼠标移开就消失了，而不需要点击其他地方。
    $(document).on('click','.dropdown_menu li',function(){
        var dataVal = $(this).find("a").attr('data-val');
        if(dataVal){
            $(this).parentsUntil(".bm_dropdown").siblings('.dropdown_link').find('.show_val').html(dataVal);
        }
    });
});


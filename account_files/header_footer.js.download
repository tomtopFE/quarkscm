//头部尾部js 

var TT_NS = (function(NS, $) {
    //TT_NS 初始化函数
    NS['init'] = function() {
        NS['NAV'].init();
    };
    NS['NAV'] = {
        init : function(){
            //三角形延时导航触发
            $("#c_nav").menuAim({
                activate: this.activateSubmenu,
                deactivate: this.deactivateSubmenu,
                exitMenu: function() {
                    return true;
                }
            });
            // $('.subSecond').menuAim({
            //     rowSelector: "> a",
            //     activate: function(row){
            //         var _index = $(row).index();
            //         $(row).parent('.subSecond').siblings('.subThird').removeClass('thirdBlock');
            //         $(row).parent('.subSecond').siblings('.subThird').eq(_index).addClass('thirdBlock');
            //         $(row).addClass('subSecondAci');
            //         $(row).siblings().removeClass('subSecondAci');
            //     },
            //     exitMenu: function() {
            //         return true;
            //     }
            // });
            this.fnGrouping();
            this.showTomtopSubmenu();
            this.notIndexNavShow();
        },
        activateSubmenu : function(row){
            var $row = $(row),
            $submenu = $row.find('.slide_menu');
            $submenu.css({display: "block"});
            $row.find(".nav_first").addClass("maintainHover");
        },
        deactivateSubmenu : function(row){
            var $row = $(row),
            $submenu = $row.find('.slide_menu');
            $submenu.css({display:"none"});
            $row.find(".nav_first").removeClass("maintainHover");
        },
        /*tomtop导航js*/
        'showTomtopSubmenu' : function(){
            var oTime = new Object();
            var categoryContainer =  $(".m_nav_category .nav_l ul");
            var cateFixed = $(this).parents('.fixed_category').length;
            $('body').on('click','.fixed_category .icon_sidebar',function(){
                categoryContainer.show();
            });
            $('body').on('mouseleave','.fixed_category .icon_sidebar',function(){
                oTime['1'] = setTimeout(function(){
                   categoryContainer.hide();
                },200)
            });
            $(".m_nav_category li").hover(function(){
                //关闭所有定时器
                var _this = $(this);
                var index = $(".m_nav_category li").index(_this);
                //关闭所有导航
                $(this).parents('.nav_l').css('z-index',200);
                $(".m_nav_category .nav_first .slide_menu").css('z-index',0)//.show();
                //显示当前导航
                _this.addClass('cur').siblings().removeClass('cur');
                _this.find(".slide_menu").css('z-index',1)//.show();
            },function(){
                var _this = $(this);
                //_this.find(".slide_menu").hide();
                _this.removeClass('cur');
            });
            $(".menu_wrap dl").hover(function(){
                $(this).addClass('cur').siblings().removeClass('cur');
            });
            //显示遮罩层
            // categoryContainer.hover(function(){
            //     $(this).parents('.nav_l').css('z-index',200);
            //     clearTimeout(oTime['1']);
            //     if($('.mask2').length == 0){
            //         var el = '<div class="mask2"></div>';
            //         $("body").append(el);
            //         $(".m_top_nav .dropdown_link,.m_top_nav .dropdown_menu").css('z-index',50);
            //     }
            // },function(){
            //     $('.mask2').remove();
            //     $(this).parents('.nav_l').css('z-index',80);
            //     $(".m_top_nav .dropdown_link").css('z-index',400);
            //     $(".m_top_nav .dropdown_menu").css('z-index',300);
            //     if($(this).parents('.m_nav_category').find('.fixed_category').size()>0){
            //         $(this).hide();
            //     }
            // })
        },
        /*导航分组 by wxl*/
        'fnGrouping' : function(i){
            //类目分组
            var iMaximum = 20;
            var objs = $('.slide_menu').not('.m_nav_tomtop .slide_menu');
            for (var j = 0; j < objs.length; j++) {
                //根据不同类目设置每列放置的高度。
                //quarkscm的分类， 少一类
                var i = j-1;
                if(i == 2){
                   iMaximum = 30;
                   console.log(iMaximum);
                }else if(i == 9){
                   iMaximum = 25;
                }else if(i == 6){
                   iMaximum = 25;
                }else if(i==8){
                   iMaximum = 18;
                }else{
                   iMaximum = 20;
                }
                fnGrouping(i);
            };
            function fnGrouping(index) {
                fnGr();
                function fnGr(){
                    var obj = objs.eq(index).children('.list_col').last();  //最后一个list
                    var objLen = obj.find('a').length;
                    if(objLen > iMaximum){
                        var oBeyond = obj.find('a').eq(iMaximum).parents('dl'); //找到超出的 dl
                        var oAllBeyond = null;
                        if (oBeyond.prevAll().length == 0) {    //上面没有了
                            oAllBeyond = oBeyond.nextAll();
                        }
                        else {
                            oAllBeyond = oBeyond.add(oBeyond.nextAll()); //自身和超出以后的;
                        };
                        var sTakeAway = oAllBeyond.clone();
                        var newElems = $('<div class="menu_wrap list_col"></div>');
                        newElems.append(sTakeAway);
                        obj.after(newElems);
                        oAllBeyond.remove();
                        if (oBeyond.nextAll().length == 0) {
                            fnGr();
                        };
                    };
                };
            };
        },
        //除首页之外显示导航下拉
        'notIndexNavShow':function(){
            var timmer = null;
            var navH = $(".nav_hide");
            var navContent = navH.children('ul');
            if($(".nav_hide").size()>0){
                navH.hover(function(){
                    clearTimeout(timmer);
                    navContent.show();
                },function(){
                    timmer = setTimeout(function(){
                        navContent.hide();
                    },200)
                })
            }
        }
    };
    return NS;
})(window.TT_NS || {}, jQuery);
TT_NS.init(); //common初始化

//=========================公共方法===============================
var TT_NS = (function(NS, $){
    //==============下拉国家==============//
    $(document).on('click','.m_pullDown_country .result,.m_pullDown_country .arrow',function(e){
        $(this).closest(".left").removeClass("error");
        $(this).siblings('.m_more_country').slideToggle();
        $(this).parents('.m_pullDown_country').find('.arrow').toggleClass('down');
        e.stopPropagation();
    });
    $(document).on('click','.m_pullDown_country .m_more_country li',function(){
        var newElems=$(this).html();
        var oResult=$(this).parents('.m_pullDown_country').find('.result');
        var sClassName = $(this).attr('class');
        oResult.removeClass().addClass('result '+sClassName);
        oResult.html(' ');
        oResult.html(newElems);

        var sVal = $(this).attr('countrycode');
        $(this).parent().parent().find('.country_id').val(sVal);
        $(this).parents('.m_more_country').slideUp();
        $(this).parents('.m_pullDown_country').find('.arrow').removeClass('down');
    });
    $(document).on('mouseleave','.m_pullDown_country',function(e){
        $('.m_more_country').slideUp();
        $('.m_pullDown_country').find('.arrow').removeClass('down');
    });
    $(document).on('click','.m_pullDown_country .m_more_country',function(e){
        e.stopPropagation();
    });
    $(document).on('keyup','.m_pullDown_country .m_more_country input',function(){
        var strA=$(this).val().toLowerCase();
        var obj=$(this).parents('.m_more_country').find('li');
        obj.each(function(){
            var strB=$(this).find('em').text().toLowerCase();
            if(strB.search(strA)!=-1){
                $(this).show();
            }else{
                $(this).hide();
            }
        });
    });

    $(document).on('click','.region_wrap',function(e){
        $(this).removeClass("error");
        e.stopPropagation();
    });
    //==============下拉国家 end==============//
    //==========修改个人信息验证=============//
    $("#editAccount .profile_edit").click(function(){
        $('#editAccount li').removeClass('error');
        var input = $("#editAccount").find(".proText");
        input.each(function(){
            if($(this).val()==""){
                $(this).siblings("em").show().text(TT_NS.lang.getLangForKey("account.cantLeaveEmpty"));
                $(this).closest("li").addClass("error");
            }
        });
        if(!$("input[name='gender']:checked").val()){//验证是否输入了性别。
            $("input[name='gender']").siblings("em").show().text(TT_NS.lang.getLangForKey("account.cantLeaveEmpty"));
            $("input[name='gender']").closest("li").addClass("error");
        };
        var checkbirthday=true;
        var birthdayInput=$(".bm_birthday").find('.hobby_birthday');
        birthdayInput.each(function(){//验证是否输入了生日。
            if($(this).val()==""){
                checkbirthday=false;
            }
        });
        if(checkbirthday){//验证是否输入了生日。
            birthdayInput.closest("li").find(".birth_error").hide();
            birthdayInput.closest("li").removeClass("error");
        }else{
            birthdayInput.closest("li").find(".birth_error").show().text(TT_NS.lang.getLangForKey("account.cantLeaveEmpty"));
            birthdayInput.closest("li").addClass("error");
        }
        if($("#editAccount").find(".error").length==0){
            var form_data = $("#editAccount").serializeArray();
            $.ajax({
                type : "POST",
                url  : "/profile/editprofile",
                data : form_data,
                dataType : 'json',
                success : function(data)
                {
                    if (data.ret == 1) {
                        window.location.reload();
                    }else{
                        var dom = $("#editAccount input[name='account']");
                        dom.closest('li').addClass('error');
                        dom.siblings().text(data.msg)
                    }
                }
            });
        }else{
            return false;
        }
    })
    $("#editAccount .proText").blur(function(){
        if($(this).val()==""){
            $(this).siblings("em").text(TT_NS.lang.getLangForKey("account.cantLeaveEmpty"));
            $(this).closest("li").addClass("error");
        }
    })
    $("#editAccount .proText").focus(function(){
        //$(this).siblings("em").hide();
        $(this).closest("li").removeClass("error");
    })
    //=================修改个人信息验证结束================//
    //弹层修改地址
    $('.m_address_box .address_edit,.m_address_box .address_add').click(function(){
        var _this = $(this);
        if (!_this.hasClass('hasAjax'))
        {
            $(this).addClass('hasAjax');
            var type = $(this).attr("datatype");
            var typeId = $(this).attr("dataid");
            $.ajax({
                type : 'GET',
                cache : false,
                url: "/customer/address/popedit?type="+type+"&address_id="+typeId,
                dataType: 'html',
                success: function(html)
                {
                    $('.m_set_address').html(html);
                    TT_NS['dialog'].dialogBg(true, {css:{'z-index':999}});
                    $('.m_set_address').addClass('dialog_show');
                    _this.removeClass('hasAjax');
                },
                error:function(){_this.removeClass('hasAjax');}
            });
        }

    });
    //选择地址
    $('.m_address_box .address .checkA').click(function(){
        var flag=true;
        $(this).toggleClass('select');
        $(".m_address_box .address .checkA").each(function(index,el){
            if(! $(el).hasClass('select')){
                flag=false;
            }
        })
        if(flag){
            $('.m_address_box .other .checkA').addClass('select');
        }else{
            $('.m_address_box .other .checkA').removeClass('select');
        }
    });

    //性别选择
    $('body').on('click','.gender_list li',function(){
        $(".gender").val($(this).data('value'));
        $(this).siblings().removeClass("sel");
        $(this).addClass("sel");
    });
    //设置为默认地址
    $('.m_address_box').on('click','.setting_default',function(){
        var type = $(this).attr('dataType');
        var id  = $(this).attr('dataId');
        $.ajax({
            type : "GET",
            url : "/customer/address/ajax-set-default",
            dataType: 'json',
            data :{'id':id,'type':type},
            success:function(data){
                if (data.ret == 1) {
                    window.location.href='/customer/address';
                }else{
                    TT_NS['dialog'].confirm({
                        addClass: 'confirm_class',
                        // title: '这就是询问对话框的标题内容...',
                        content: data.msg,
                        btnTextB:TT_NS.lang.getLangForKey("product.ok"),
                        shake: true
                    });
                }
            }
        });
    });

    //全选地址
    $('.m_address_box .other .checkA').click(function(){
        if($(this).hasClass('select')){
            $(this).removeClass('select');
            $('.m_address_box .address .checkA').removeClass('select');
        }else{
            $(this).addClass('select');
            $('.m_address_box .address .checkA').addClass('select');
        };
    });
    //添加地址的时候进行样式表单验证
    $(document).on("click","#shipping_address .save_address_btn",function(){
        var _this=$(this);
        var input =$(this).closest(".list").siblings(".list").find(".proText");
        input.each(function(){
            if($(this).val()==""){
                $(this).siblings("p").text($(this).siblings("p").data('tips'));
                $(this).closest("div").not(".can-empty").addClass("error");
            }
        });
        //国家为空
        var country = $("#shipping_address .country_id");
        if(country.val() == ''){
            country.closest(".left").addClass("error");
            var oError = country.closest(".m_pullDown_country").siblings("p");
            oError.text(oError.data('tips'));

        }

        // var region = $("#shipping_address .region_val");
        // if(region.val() == ''){
        //     region.closest(".right").addClass("error");
        //     var oError = region.closest(".region_more").siblings("p");
        //     oError.text(oError.data('tips'));
        // }

        if($("#shipping_address").find(".error").length==0 && _this.parents("#shipping_address").find(".erro_info").length==0 && !_this.hasClass('hasAjax')){
            _this.addClass('hasAjax');
            var count =  $(".address_book li").length;
            var form_data = $("#shipping_address").serializeArray();
            form_data.push({"name":"count","value":count});
            $.ajax({
                type : "POST",
                url  : "/customer/address/ajax-save",
                data : form_data,
                dataType : 'json',
                success : function(data)
                {
                    if (data.ret == 1) {
                        window.location.href = '/customer/address';
                    }else{
                        _this.parents("#shipping_address").find(".dialog_main h4").before("<span class='erro_info'>"+data.msg+"</span>");
                        _this.removeClass('hasAjax');
                    }
                }
            });
        }else{
            return false;
        }
    })
    $(document).on("blur","#shipping_address .proText",function(){
        if($(this).val()==""){
            $(this).siblings("p").text($(this).siblings("p").data('tips'));
            $(this).closest("div").not(".can-empty").addClass("error");
        }

    });

    $(document).on("focus","#shipping_address .proText",function(){
        $(this).closest("div").removeClass("error");
    });
    //邮政编码正则输入判断
    $(document).on('keyup','.postCode_val',function(){
        var txt=$(this).val();
        var lastVal=txt.replace(/(^[^A-Za-z0-9]+)|([^\s\w-]+)|[/_]/gi,'').replace(/[\s-]{2,}/gi,'')
            .replace(/([\s\w-]{1,10})(.*)/,'$1');
        $(this).val(lastVal);
    });
    $(document).on('blur','.postCode_val',function(){
        var txt=$(this).val();
        var txtVal=txt.substring(txt.length-1,txt.length);
        if(txtVal==' '||txtVal=='-'){
            var strLast=txt.substring(0,txt.length-1);
            $(this).val(strLast);
        }
    });
    //删除地址
    $('.m_address_box .address_remove').click(function(){
        var length = $(".address_box_c li").length;
        if(length > 1){
            var dataId = $(this).attr('dataId');
            var _this =$(this);
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: 'Are you sure to delete it?',
                btnTextA: 'Cancel',
                btnTextB: 'Ok',
                shake: true
            },function (o) {
                if(o){
                    $.ajax({
                        type : "POST",
                        url : "/customer/address/ajax-remove",
                        dataType:'json',
                        data :{'dataId':dataId},
                        success:function(data){
                            if (data.ret == 1) {
                                _this.parent().parent('li').remove();
                            }else{
                                TT_NS['dialog'].alert({
                                    content: "Error",
                                    btnTextB: "Ok",
                                    shake: true
                                });
                            }
                        }
                    });
                };
            });

        }else{
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: "The last shipping address can not be deleted",
                btnTextA: "Cancel",
                btnTextB: "Ok",
                shake: true
            });
        }

    });
    //删除全部地址
    $('.m_address_box .remove_all p').click(function(){
        if ($('.address_select').find('.select').length >0 && $(".address_book li").length>1) {
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: TT_NS.lang.getLangForKey('account.sureToDeleteAll','Are you sure to delete all?'),
                btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                shake: true
            },function (o) {
                if(o){
                    var arr = []
                    $('.address_select').find('.select').each(function(){
                        arr.push($(this).attr('dataId'));
                    });
                    $.ajax({
                        type : "POST",
                        url : "/address/delete",
                        dataType:'json',
                        data :{'dataId':arr.join(',')},
                        success:function(data){
                            if (data.ret == 1) {
                                $('.address_select').find('.select').parent().parent('li').remove();
                            }else{
                                TT_NS['dialog'].alert({
                                    content: data.msg,
                                    btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                    shake: true
                                });
                            }
                        }
                    });

                };
            });
        };
    });

    //==========我的优惠卷==========//
    //选项卡
    $(".m_my_coupon").on('click','.bm_tab_but li',function(){
        var _this = $(this);
        var index=_this.index();
        var oCur=$(".my_all_coupon_c ul").children('li').eq(index);
        oCur.addClass('page_cur').siblings().removeClass('page_cur');
        _this.addClass('cur').siblings().removeClass('cur');
        oCur.html('<div class="ajax_loding"></div>').show().siblings().hide();
        if (!_this.hasClass('hasAjax'))
        {
            var type = _this.attr('data-type');
            _this.addClass('hasAjax');
            $.ajax({
                type : 'GET',
                url : TT_CONFIG.userLangUrl + "/wallet/coupon",
                data :{'type':type},
                dataType:'html',
                success:function(html)
                {
                    $(".my_all_coupon_c ul").children('li').eq(index).html(html);
                    _this.removeClass('hasAjax');
                },
                error:function()
                {
                    _this.removeClass('hasAjax');
                }
            });
        };
    });
    //==========我的信息==========//
    //选择信息
    $(".m_my_message").on('click','dd .checkA',function(){
        var flag=true;
        $(this).toggleClass('select');
        $(".m_my_message .message dd .checkA").each(function(index,el){
            if(! $(el).hasClass('select')){
                flag=false;
            }
        })
        if(flag){
            $('.m_my_message .message dt .checkA').addClass('select');
        }else{
            $('.m_my_message .message dt .checkA').removeClass('select');
        }
    });
    //选择全部信息
    $(".m_my_message").on('click','dt .checkA',function(){
        if($(this).hasClass('select')){
            $(this).removeClass('select');
            $('.m_my_message .message dd .checkA').removeClass('select');
        }else{
            $(this).addClass('select');
            $('.m_my_message .message dd .checkA').addClass('select');
        };
    });


    //选项卡
    $(".m_my_message").on('click','.bm_tab_but li',function(){
        var _this = $(this);
        var index = _this.index();
        oCur = $(".my_message_list").children('li').eq(index);
        oCur.addClass('page_cur').siblings().removeClass('page_cur');
        TT_NS['oprationClass'].radioClass($('.m_my_message .bm_tab_but li'),$(this),'cur');
        oCur.html('<div class="ajax_loding"></div>').show().siblings().hide();

        if (!_this.hasClass('hasAjax'))
        {
            var type = _this.attr('data-type');
            _this.addClass('hasAjax');
            $.ajax({
                type : 'GET',
                url : "/message/index",
                data :{'type':type},
                dataType:'html',
                success:function(html)
                {
                    $(".my_message_list").children('li').eq(index).html(html);
                    _this.removeClass('hasAjax');
                },
                error:function()
                {
                    _this.removeClass('hasAjax');
                }
            });
        };
    });

    //删除多选信息
    $('.m_my_message .title .delete').click(function(){
        if ($('.m_my_message .message dd .select').length >0) {
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: TT_NS.lang.getLangForKey('account.sureToDelete','Are you sure to delete it?'),
                btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                shake: true
            },function (o) {
                if(o){
                    var arr = []
                    $('.m_my_message .message dd .select').each(function(){
                        var item = $(this).attr('dataId')+":"+$(this).attr('tab');
                        arr.push(item);
                    });
                    $.ajax({
                        type : "POST",
                        url : "/message/delete",
                        dataType:'json',
                        data :{'dataId':arr.join(',')},
                        success:function(data){
                            if (data.ret == 1) {
                                $('.m_my_message .message dd .select').parent().parent().remove();
                                window.location.reload();
                            }else{
                                TT_NS['dialog'].alert({
                                    content: data.msg,
                                    btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                    shake: true
                                });
                            }
                        }
                    });
                };
            });
        };
    });

    //多选信息设为已读取
    $('.m_my_message .title .read').click(function(){
        if ($('.m_my_message .message dd .select').length >0) {
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: TT_NS.lang.getLangForKey('account.sureToRead','Are you sure to read it?'),
                btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                shake: true
            },function (o) {
                if(o){
                    var arr = []
                    var objs = $('.m_my_message .message dd .select');
                    objs.each(function(){
                        var item = $(this).attr('dataId')+":"+$(this).attr('tab');
                        arr.push(item);
                    });
                    console.log(arr);
                    $.ajax({
                        type : "POST",
                        url : "/message/read",
                        dataType:'json',
                        data :{'dataId':arr.join(',')},
                        success:function(data){
                            if (data.ret == 1) {
                                if($(".my_message_list .page_cur").index()==1)
                                {
                                    objs.parent().parent().remove();
                                }else{
                                    objs.parent().parent().addClass('is_read');
                                }
                            }else{
                                TT_NS['dialog'].alert({
                                    content: data.msg,
                                    btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                    shake: true
                                });
                            }
                        }
                    });
                };
            });
        };
    });

    //进入详情设为已读
    $(".my_message_list .subject a").on('click',function(){
        var _this = $(this);
        var url = _this.attr('href');
        $.ajax({
            type : 'GET',
            url  : url,
            dataType : 'json',
            success : function(data)
            {
                if (data.ret == 1)
                {
                    _this.parent().parent().addClass('is_read');
                }
            }
        });
    });


    //==========我的订单==========//
    //订单物流号
    var app_sale = {
        'timmer':null,
        'init' :function(){
            var _this = this;
            _this.showEwm();
        },
        /*显示*/
        'showEwm':function(){
            var _this = this;
            $(document).on('mouseover','.track_contain .track_num',function () {
                $(this).next('.track_information').show();
            });
            $(document).on('mouseout','.track_contain .track_num',function () {
                var self = $(this);
                _this.timmer = setTimeout(function(){self.next('.track_information').hide();},200);
            });
            $(document).on('mouseover','.track_information',function(){
                clearTimeout(_this.timmer);
                $(this).show();
            });
            $(document).on('mouseout','.track_information',function(){
                $(this).hide();
            })
        }
    };
    $(function(){
        app_sale.init();
    })
    //选项卡
    $('.order_box .bm_tab_but li').click(function(){
        var index = $(this).index();
        TT_NS['oprationClass'].radioClass($('.order_box .bm_tab_but li'),$(this),'cur');
        var oCur =$('.order_main ').children('li').eq(index);
        oCur.addClass('page_cur').siblings().removeClass('page_cur');
        oCur.html('<div class="ajax_loding"></div>').show().siblings().hide();
        if (!$(this).hasClass('hasAjax'))
        {
            if(index == '4')
            {
                $("input[name='isShow']").val(2);
            }else
            {
                $("input[name='isShow']").val('');
            }
            var status = $(this).attr('cate_id');
            var size = $("input[name=size]").val();
            var isShow = $("input[name=isShow]").val();
            var _this = $(this);
            _this.addClass('hasAjax');
            $.ajax({
                type : 'GET',
                url : TT_CONFIG.userLangUrl + "/order/index",
                data :{'status':status,'size':size,'isShow':isShow},
                dataType:'html',
                success:function(html)
                {
                    $('.order_main ').children('li').eq(index).html(html);
                    _this.removeClass('hasAjax');
                    for(var i = 0; i<$('.count_time').length; i++){
                        //首次执行所有产品默认仓库倒计时
                        $('.count_time').eq(i).attr('ctnum','count_time'+i);
                        fnCountdownD($('.count_time').eq(i));
                    };
                },
                error:function()
                {
                    _this.removeClass('hasAjax');
                }
            });

        };

    });

    //订单每页显示条数选择
    $('.show_c').on('click','.page_search',function(){
        var page = $(this).html();
        $("input[name='size']").val(page);
        $(this).addClass('cur').siblings().removeClass('cur');
        var index = $('.order_box .bm_tab_but .cur').index();
        var oCur =$('.order_main ').children('li').eq(index);
        oCur.html('<div class="ajax_loding"></div>').show().siblings().hide();

        var status = $('.order_box .bm_tab_but .cur').attr('cate_id');
        var size = $("input[name=size]").val();
        var isShow = $("input[name=isShow]").val();

        var _this = $('.order_box .bm_tab_but .cur');
        $.ajax({
            type : 'GET',
            url : TT_CONFIG.userLangUrl + "/order/index",
            data :{'status':status,'size':size,'isShow':isShow},
            dataType:'html',
            success:function(html)
            {
                oCur.html(html);
            }
        });
    });

    //订单搜索
    $('#search_submit').on('click',function()
    {
        var index = $('.order_box .bm_tab_but .cur').attr('index');
        var oCur= $('.order_main ').children('li').eq(index);
        $('.order_main ').children('li').html('<div class="ajax_loding"></div>');
        $("input[name='isShow']").val('');
        var form_data = $('#orderSearch').serializeArray();
        $.ajax({
            type :'GET',
            url : TT_CONFIG.userLangUrl + "/order/index",
            data: form_data,
            dataType: 'html',
            success:function(html)
            {
                oCur.html(html);
            }
        });
    });

    //选择订单
    $('.order_box').on('click','thead .checkA',function(){
        $(this).toggleClass('select');
        $(this).parents('li').find('.other .checkA').removeClass('select');
    });
    //选择全部订单
    $('.order_box').on('click',' .order_select_all',function(){
        if($(this).hasClass('select')){
            $(this).removeClass('select');
            $(this).parents("li").find(".thead").find(".checkA").removeClass('select');
        }else{
            $(this).addClass('select');
            $(this).parents("li").find(".thead").find(".checkA").addClass('select');
        };
    });
    //删除订单
    $(".order_box").on('click','.order_delete',function(){
        var ids = $(this).parents('.m_order_list').attr('order-id');
        var type = $(this).attr('data-type');
        var content = '';
        if (type == 'RECOVER') {
            content = TT_NS.lang.getLangForKey('account.sureToRestore','Are you sure to restore it?');

        }else{
            content = TT_NS.lang.getLangForKey('account.sureToDelete','Are you sure to delete it?');
        }
        var _this = $(this);
        TT_NS['dialog'].confirm({
            addClass: 'confirm_class',
            // title: '这就是询问对话框的标题内容...',
            content: content,
            btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
            btnTextB: TT_NS.lang.getLangForKey("product.ok"),
            shake: true
        },function (o) {
            if(o){
                $.ajax({
                    type: "POST",
                    url : "/order/delorders",
                    data:{'order_ids':ids,'type':type},
                    dataType:'json',
                    success:function(data)
                    {
                        if (data.ret ==1)
                        {
                            var index = $('.order_box .bm_tab_but .cur').attr('index');
                            var oCur= $('.order_main ').children('li').eq(index);
                            _this.parents('table').remove();

                            //修改状态
                            $('.order_status_recycle').html('<i></i>('+data.recycle+')');
                            $('.order_status_all').html('('+data.all+')');
                            $('.my_orders_count').html(data.all);
                            $('.order_status_pending').html('('+data.pending+')');
                            $('.order_status_confirmed').html('('+data.confirmed+')');
                            $('.order_status_processing').html('('+data.processing+')');

                            if (oCur.find('table').length == 0)
                            {
                                $('.order_box .bm_tab_but .cur').click();
                            }

                        }else
                        {
                            TT_NS['dialog'].alert({
                                content: data.msg,
                                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                shake: true
                            });
                        }
                    }
                });
            };
        });

    })

    //删除全部订单
    $('.order_box').on('click','.remove_all p',function(){
        var arr = []
        $('.order_main table thead').find('.select').each(function(){
            arr.push($(this).parents('.m_order_list').attr('order-id'));
        });
        var type = $(this).attr('data-type');
        var content = '';
        if (type == 3) {
            content = TT_NS.lang.getLangForKey('account.sureToRestore','Are you sure to restore it?');

        }else{
            content = TT_NS.lang.getLangForKey('account.sureToDelete','Are you sure to delete it?');
        }
        if (arr.length != 0) {
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: content,
                btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                shake: true
            },function (o) {
                if(o){
                    $.ajax({
                        type: "POST",
                        url : "/order/delorders",
                        data:{'order_ids':arr.join(','),'type':type},
                        dataType:'json',
                        success:function(data)
                        {
                            if (data.ret ==1)
                            {
                                var index = $('.order_box .bm_tab_but .cur').attr('index');
                                var oCur= $('.order_main ').children('li').eq(index);
                                $('.order_main table thead').find('.select').parents('table').remove();

                                //修改状态
                                $('.order_status_recycle').html('<i></i>('+data.recycle+')');
                                $('.order_status_all').html('('+data.all+')');
                                $('.my_orders_count').html(data.all);
                                $('.order_status_pending').html('('+data.pending+')');
                                $('.order_status_confirmed').html('('+data.confirmed+')');
                                $('.order_status_processing').html('('+data.processing+')');

                                if (oCur.find('table').length == 0)
                                {
                                    $('.order_box .bm_tab_but .cur').click();
                                }
                            }else
                            {
                                TT_NS['dialog'].alert({
                                    content: data.msg,
                                    btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                    shake: true
                                });
                            }
                        }
                    });
                };
            });
        }
    });


    //==========我的金币==========//
    //选项卡
    $(".m_my_points").on('click','.bm_tab_but li',function(){
        var _this = $(this);
        var index=_this.index();
        var oCur=$(".my_all_coupon_c ul").children('li').eq(index);
        oCur.addClass('page_cur').siblings().removeClass('page_cur');
        _this.addClass('cur').siblings().removeClass('cur');
        oCur.html('<div class="ajax_loding"></div>').show().siblings().hide();
        if (!_this.hasClass('hasAjax'))
        {
            var type = _this.attr('data-type');
            var size = $(".m_my_points .show_num").find('.on').text();
            _this.addClass('hasAjax');
            $.ajax({
                type : 'GET',
                url : "/wallet/point",
                data :{'type':type,'size':size},
                dataType:'html',
                success:function(html)
                {
                    $(".my_all_coupon_c ul").children('li').eq(index).html(html);
                    _this.removeClass('hasAjax');
                },
                error:function()
                {
                    _this.removeClass('hasAjax');
                }
            });
        };
    });

    //分页选择
    $(".m_my_points").on('click','.show_num a',function(){
        $(this).addClass('on').siblings().removeClass('on');
        $(".m_my_points .bm_tab_but ").find('.cur').click();
    })

    //===========我的资料===========//
    //选项卡
    $('.m_personal_profile .profile .bm_tab_but li').click(function(){
        var index=$('.m_personal_profile .profile .bm_tab_but li').index($(this));
        TT_NS['oprationClass'].radioClass($('.m_personal_profile .profile .bm_tab_but li'),$(this),'cur');
        var oCur=$('.m_personal_profile .profile .profile_c>li').eq(index);
        $('.m_personal_profile .profile .profile_c>li').not(oCur).hide();
        oCur.fadeIn();
    });

    //弹层修改头像
    $('.m_personal_profile .edit_picture').click(function(){
        $(this).blur();
        TT_NS['dialog'].dialogBg(true, {css:{'z-index':999}});
        $('.m_set_picture').addClass('dialog_show');
    });


    //===========评论页面===========//

    //评论每页显示条数选择
    $('.reviews_header').on('click','.show_c a',function(){
        $(this).addClass('cur').siblings().removeClass('cur');
        $("input[name=size]").val($(this).text());
        $(".reviews_header .review_search").click();
    });

    //评论搜索
    $(".reviews_header .review_search").on('click',function(){
        var index = $('.reviews_box .bm_tab_but').find('.cur').index();
        var oCur= $('.reviews_box .m_reviews_list').children('li').eq(index);
        oCur.html('<div class="ajax_loding"></div>');
        var form_data = $('#reviewSearch').serializeArray();
        $.ajax({
            type :'GET',
            url : TT_CONFIG.userLangUrl + "/review/index",
            data: form_data,
            dataType: 'html',
            success:function(html)
            {
                oCur.html(html);
            }
        });
    });

    //===========收藏页面===========//
    //选择我的收藏
    $('.wishlist_box .m_wishlist_list .checkA').click(function(){
        var flag=true;
        $(this).toggleClass('select');
        $(".wishlist_box .m_wishlist_list .checkA").each(function(index,el){
            if(! $(el).hasClass('select')){
                flag=false;
            }
        })
        if(flag){
            $('.wishlist_box .other .checkA').addClass('select');
        }else{
            $('.wishlist_box .other .checkA').removeClass('select');
        }
    });

    //我的收藏搜索
    $('.search .wish_search').on('click',function(){
        $('#wishSearch').submit();
    });

    //全选我的收藏
    $('.wishlist_box .other .checkA').click(function(){
        if($(this).hasClass('select')){
            $(this).removeClass('select');
            $('.wishlist_box .m_wishlist_list .checkA').removeClass('select');
        }else{
            $(this).addClass('select');
            $('.wishlist_box .m_wishlist_list .checkA').addClass('select');
        };
    });
    //删除收藏
    $('.wishlist_box .remove_wishlist').click(function(){
        var ids = $(this).find('a').attr('dataid');
        var _this =$(this);
        TT_NS['dialog'].confirm({
            addClass: 'confirm_class',
            // title: '这就是询问对话框的标题内容...',
            content: TT_NS.lang.getLangForKey('account.sureToDelete','Are you sure to delete it?'),
            btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
            btnTextB: TT_NS.lang.getLangForKey("product.ok"),
            shake: true
        },function (o) {
            if(o){
                $.ajax({
                    type :"POST",
                    url: "/wish/delete",
                    data:{'ids':ids},
                    dataType:'json',
                    success:function(data)
                    {
                        if (data.ret == 1) {
                            _this.parents('tr').remove();
                            $(".has_num").find("em").text(parseInt($(".has_num").find("em").text() - 1));
                            var curUrl = window.location.href;
                            var fNum = $(".has_num").find("em").text();
                            if(curUrl.indexOf('chicuu')!==-1){
                                if ($('.m_wishlist_list tbody').find('tr').length == 0 || fNum%10 == 0)
                                {
                                    var favUrl = $('.m_head .favoritesHeader').attr('href');
                                    window.location.href = favUrl;
                                }

                            }else{
                                if ($('.m_wishlist_list tbody').find('tr').length == 0)
                                {
                                    var favUrl = $('.m_head .favoritesHeader').attr('href');
                                    window.location.href = favUrl;
                                }

                            }

                        }else{
                            TT_NS['dialog'].alert({
                                content: data.msg,
                                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                shake: true
                            });
                        }
                    }


                });
            };
        });
    });
    //删除全部 whish
    $('.wishlist_box .remove_all p').click(function(){
        var arr = [];
        var objs = $('.m_wishlist_list table td').find('.select');
        objs.each(function(){
            arr.push($(this).attr('data-id'));
        })
        if(arr.length != 0){
            TT_NS['dialog'].confirm({
                addClass: 'confirm_class',
                // title: '这就是询问对话框的标题内容...',
                content: TT_NS.lang.getLangForKey('account.sureToDeleteAll','Are you sure to delete all?'),
                btnTextA: TT_NS.lang.getLangForKey("product.cancel"),
                btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                shake: true
            },function (o) {
                if(o){
                    $.ajax({
                        type :"POST",
                        url: "/wish/delete",
                        data:{'ids':arr.join(',')},
                        dataType:'json',
                        success:function(data){
                            if (data.ret == 1) {
                                objs.parents('tr').remove();
                                $(".has_num").find("em").text(parseInt($(".has_num").find("em").text() - arr.length));
                                var curUrl = window.location.href;
                                var fNum = $(".has_num").find("em").text();
                                if(curUrl.indexOf('chicuu')!==-1){//chicuu的分页，这个地方最好是让后台传一个分页数给我。
                                    if ($('.m_wishlist_list tbody').find('tr').length == 0 || fNum%10 == 0)
                                    {
                                        var favUrl = $('.m_head .favoritesHeader').attr('href');
                                        window.location.href = favUrl;
                                    }

                                }else{
                                    if ($('.m_wishlist_list tbody').find('tr').length == 0)
                                    {
                                        var favUrl = $('.m_head .favoritesHeader').attr('href');
                                        window.location.href = favUrl;
                                    }

                                }
                            }else{
                                TT_NS['dialog'].alert({
                                    content: data.msg,
                                    btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                                    shake: true
                                });
                            }
                        }

                    });
                };
            });
        };
    });
    //我的评论星星评分js功能
    $(document).on("mouseover",".product_Reviews em",function(){
        var index = $(this).index()+1;
        $(this).parents(".product_Reviews").addClass("startH"+index);
    })
    $(document).on("mouseleave",".product_Reviews em",function(){
        var index = $(this).index()+1;
        $(this).parents(".product_Reviews").removeClass("startH"+index);
    })
    $(document).on("click",".product_Reviews em",function()
    {
        var index = $(this).index()+1;
        if ($(this).parents(".product_Reviews").attr("class").indexOf('start')>0){
            var length = $(this).parents(".product_Reviews").attr("class").indexOf('start');
            var start = $(this).parents(".product_Reviews").attr("class").substr(length,'start'.length+1);
            $(this).parents(".product_Reviews").removeClass(start);
        }
        $(this).parents(".product_Reviews").addClass("start"+index);
        $(this).parents(".product_Reviews").siblings("input").val(index);
        var priW = parseInt($("input[name='ipriceStarWidth']").val());
        var qutW = parseInt($("input[name='iqualityStarWidth']").val());
        var useW = parseInt($("input[name='iusefulness']").val());
        var shipW = parseInt($("input[name='ishippingStarWidth']").val());
        var allStartW = priW+qutW+useW+shipW;
        var percent = (allStartW/4)*20+"%";
        $("#foverallratingStarWidth").css({'width':percent});
    })
    //单张图片上传构造函数
    function Upload(){
        this.uploadForm=$("#photo-form");
        this.saveBtn=$('#head_image_save');
        this.previewEle = $('#preview');
        this.inputFile = this.uploadForm.find(':file');
        this.erroMsg = $(".erro_msg");
        this.loading=$(".upload_loding");
        this.saveBtn.attr("disabled", "disabled");
        this.acceptSize = 120;
        this.loading=$(".upload_loding").hide()
        this.listener();
    }
    Upload.prototype={
        errorCode : {
            not : 0,
            service : 1,
            type : 2,
            size : 3
        },
        listener : function() {
            this.inputFile.on('change', $.proxy(this.change, this));
            this.uploadForm.on('submit', $.proxy(this.uploadFn, this));
        },
        clear : function() {//清除上传控件。
            var inputClone = this.inputFile.clone(true);
            this.inputFile.after(inputClone);
            this.inputFile.remove();
            this.inputFile = inputClone;
        },
        error : function(code) {
            switch (code) {
                case this.errorCode.size: {
                    this.erroMsg.show().html('max size ' + this.acceptSize + 'kb');
                    break;
                }
                case this.errorCode.type: {
                    this.erroMsg.show().html('Invalid image formats');
                    break;
                }
                case this.errorCode.service: {
                    this.erroMsg.show().html('service error');
                    break;
                }
            }
            this.saveBtn.attr("disabled", "disabled");
            this.clear();
        },
        change : function(e, invoked) {
            var file = e.target.files !== undefined ? e.target.files[0]
                : (e.target.value ? {
                    name : e.target.value.replace(/^.+\\/, '')
                } : null)
            if (invoked === 'clear') {
                this.clear();
                return;
            }

            if (!file) {
                this.clear();
                return;
            }
            var reg = /^.*\.(jpg|gif|png)$/i;
            if (!reg.test(file.name)) {
                this.error(this.errorCode.type);
                return;
            }
            var size = file.size / 1024;
            if (size > this.acceptSize) {
                this.error(this.errorCode.size);
                return;
            }
            this.erroMsg.hide().html('');
            var files = e.target.files;
            if (files && files.length > 0) {
                file = files[0];
                var URL = window.URL || window.webkitURL;
                var imgURL = URL.createObjectURL(file);
                this.previewEle.children('img').attr('src', imgURL);
                this.saveBtn.attr("disabled", false);
            }

        },
        uploadFn:function(){
            //图片上传提交
            var url = this.uploadForm.attr('action');
            var self=this;
            self.loading.show();
            this.saveBtn.attr('disabled',true);
            var _this = this.uploadForm.parents('.bm_dialog');
            $.ajax({
                type : 'POST',
                url : url,
                cache: false,
                data: new FormData($('#photo-form')[0]),
                processData: false,
                contentType: false,
                dataType : 'json',
                success : function(data){
                    if(data.ret ==1)	{
                        self.loading.hide();
                        $('#head_picture').attr("src",data.uploaedFile)
                        NS['dialog'].closeDialog(_this);
                        self.saveBtn.attr('disabled',"disabled");
                        self.clear();
                    }else{
                        self.erroMsg.show().html('service error');
                    }
                },
                error : function(){

                }
            });
            return false;
        }

    }
    var up= new Upload();


    //激活邮件发送
    $('.send_email').on('click',function(){
        var _this = $(this);
        if (! _this.hasClass('hasAjax'))
        {
            _this.addClass('hasAjax');
            $.ajax({
                type :'POST',
                url: "/account/sendemail",
                dataType : 'json',
                success:function(data)
                {
                    if (data.ret == 1)
                    {
                        TT_NS['dialog'].alert({
                            content: TT_NS.lang.getLangForKey('account.activateEmailTips','Resent successfully. Please check your email box to activate your account.'),
                            btnTextB: TT_NS.lang.getLangForKey("product.ok"),
                            shake: true
                        });
                    }
                    _this.removeClass('hasAjax');
                },
                error:function(){_this.removeClass('hasAjax');}
            });
        }
    });
    //修改密码
    $("input[name='cpassword']").focus(function(){
        if($(this).val()==''){
            $(this).siblings("em").show().text(TT_NS.lang.getLangForKey("message.cannotBeEmpty"));
            $(this).closest("li").addClass('error');
        }
    })
    //失去焦点进行验证是否为空
    $(".change_password input").each(function(){
        $(this).blur(function(){
            if($(this).val()==''){
                $(this).siblings("em").show();
                $(this).closest("li").addClass('error');
                changpsw_flag=false;
            }else if($(this).attr('name')=='cnewpassword'){
                var val=$(this).val();
                if(val.length<6 && val!==''){
                    $(this).siblings("em").show().text(TT_NS.lang.getLangForKey('account.enter6Characters',"Please enter at least 6 characters!"));
                    $(this).closest("li").addClass('error');
                }
            }else if($(this).attr('name')=='ccnewpassword'){
                var oldval=$("input[name='cnewpassword']").val();
                var val_2=$(this).val();
                if(oldval!==val_2){
                    $(this).siblings("em").show().text(TT_NS.lang.getLangForKey('account.enterPasswordAbove',"Enter the same password as above!"));
                    $(this).closest("li").addClass('error');
                }
            }
        })
    })
    //聚焦的时候将错误信息影藏。
    $(".change_password input").each(function(){
        $(this).focus(function(){
            $(this).siblings("em").hide();
            $(this).closest("li").removeClass('error');
        })
    })
    $('#change_password').on('submit',function(){
        var url = $(this).attr('action');
        var form_data = $(this).serializeArray();
        console.log(form_data);
        $.each(form_data,function(index,el){
            if(!el.value){
                $("input[name='"+ el.name +"']").closest("li").addClass('error');
                $("input[name='"+ el.name +"']").siblings("em").show();
            }
        })
        if($("#change_password").find(".error").length == 0){
            $.ajax({
                type: "POST",
                url : url,
                dataType: 'json',
                data : form_data,
                success:function(data){
                    if (data.ret == 1) {
                        window.location.href=data.redirectUrl;
                    }else{
                        if(data.errCode=='-1004' || data.errCode=='-1'){
                            $("input[name='cpassword']").closest("li").addClass('error');
                            $("input[name='cpassword']").siblings("em").show().text(data.msg);
                        }else if(data.errCode=='-1001'){
                            $("input[name='code']").closest("li").addClass('error');
                            $("input[name='code']").siblings("em").show().text(data.msg);
                        }
                    }
                }
            });
        }
        return false;
    });

    //设置为默认地址
    $('.address').on('click','.address_default_c',function(){
        var type = $(this).attr('dataType');
        var id  = $(this).attr('dataId');
        $.ajax({
            type : "GET",
            url : "/address/defaddress",
            dataType: 'json',
            data :{'id':id,'type':type},
            success:function(data){
                if (data.ret == 1) {
                    window.location.href=data.redirectUrl;
                }else{
                    TT_NS['dialog'].confirm({
                        addClass: 'confirm_class',
                        // title: '这就是询问对话框的标题内容...',
                        content: data.msg,
                        btnTextB:TT_NS.lang.getLangForKey("product.ok"),
                        shake: true
                    });
                }
            }
        });
    });


    //用户中心分页请求
    $('#page_list_container').on('click','.bm_page li a',function(){
        var url=$(this).attr('href');
        if (url)
        {
            var oCur = $('#page_list_container').find('.page_cur');
            oCur.html('<div class="ajax_loding"></div>');
            $.ajax({
                type:'GET',
                url:url,
                dataType:'html',
                success: function(html)
                {
                    oCur.html(html);
                }
            });
        }
        return false;
    });

    //===========助力免单专区页面===========//
    //弹层以及copy链接
    function initZClip() {
        $(".copy").zclip({
            // path : '//static.tomtop.com/common/acount/js/ZeroClipboard.swf',
            path : TT_CONFIG.staticUrl + '/js/ZeroClipboard.swf',
            copy : function() {
                return $(this).prev('.copyTxt').text();
            },
            afterCopy : function() {
                $(this).next('.sucTips').show();
                var $parents = $(this).parents('.m_zclip_copy').siblings('.share_pic');

                var _sku = $parents.attr('data-sku');
                var listId = $parents.attr('data-listingid');
                var storageId = $parents.attr('data-storageid');
                var actCode = $parents.attr('data-actcode');
                var shareUrl = $parents.data('url');
                $.ajax({
                    type : "POST",
                    url  : "/get-it-free/count",
                    data : {'sku':_sku,'listingId':listId,'storageId':storageId,'actCode':actCode,'sharePlatform':'copy','shareUrl':shareUrl},
                    dataType : 'json',
                    success : function(data) {

                    }
                });
            }
        });
    }
    $(document).ready(function () {
        if($('.m_zclip_copy').size() > 0){
            initZClip();
        }
    });
    //专区页面tab切换
    $(document).on('click','.m_get_free .profile_t a',function(){
        $(this).siblings('a').removeClass('cur');
        $(this).addClass('cur');
    });
    //专区弹层更新产品内容
    $(document).on('click','.getFreeBtn',function(){
        $('.m_zclip_copy .sucTips').hide();  //隐藏复制成功提示
        TT_NS['dialog'].dialogBg(true, {css:{'z-index':999}});
        $('.getFree').addClass('dialog_show');
        var $parents = $(this).parents('li.lineBlock');
        // 将产品信息塞到弹层中
        var shareUrl = $(this).parents('li.lineBlock').attr('data-url');
        var hrefLink = $(this).siblings('.productImg').attr('href');
        var prdImg = $(this).siblings('.productImg').html();
        var prdTitle = $(this).siblings('.productTitle').prop("outerHTML");
        var prdPrice = $(this).siblings('.priceWarp').html();
        $('.getFree .m_product_box .share_pic').attr('data-url',shareUrl);

        //sku,listingId,storageId,actCode,couponCode,sharePlatform,shareUrl(需要传的参数)
        $('.getFree .m_product_box .share_pic').attr('data-sku',$parents.attr('data-sku'));
        $('.getFree .m_product_box .share_pic').attr('data-listingid',$parents.attr('data-listingid'));
        $('.getFree .m_product_box .share_pic').attr('data-storageid',$parents.attr('data-storageid'));
        $('.getFree .m_product_box .share_pic').attr('data-actcode',$parents.attr('data-actcode'));
        $('.getFree .m_product_box .product_img a').attr('href',hrefLink);
        $('.getFree .m_product_box .product_img a').html(prdImg);
        $('.getFree .m_product_box .product_title').html(prdTitle).children('a').removeClass('productTitle');
        $('.getFree .product_price').html(prdPrice);
        $('.getFree .m_zclip_copy .copyTxt').text(shareUrl);
        $('.getFree .m_product_box .view_prd').attr('href',hrefLink);
        initZClip();
    });
    //助力免单页面请求(分享)
    $(document).on('click','.share_pic i',function () {
        //sku,listingId,storageId,actCode,sharePlatform,shareUrl(需要传的参数)
        var $parent = $(this).parent('.share_pic');
        var _sku = $parent.attr('data-sku');
        var listId = $parent.attr('data-listingid');
        var storageId = $parent.attr('data-storageid');
        var actCode = $parent.attr('data-actcode');
        var shareName = $(this).attr('data-name');
        var shareUrl = $parent.data('url');
        $.ajax({
            type : "POST",
            url  : "/get-it-free/count",
            data : {'sku':_sku,'listingId':listId,'storageId':storageId,'actCode':actCode,'sharePlatform':shareName,'shareUrl':shareUrl},
            dataType : 'json',
            success : function(data) {

            }
        });
    });


    //===========助力免单我的分享页面===========//
    $(document).on('click','.m_my_share .redeemCoupon button',function () {
        var _this = $(this);
        var sharePic = $(this).parent('.redeemCoupon').siblings('.share_pic');
        var _sku = sharePic.attr('data-sku');
        var storageId = sharePic.attr('data-storageid');
        var actCode = sharePic.attr('data-actcode');
        $(this).addClass('disRedeem');

        //sku,storageId(需要传的参数)
        $.ajax({
            type : "POST",
            url  : "/get-it-free/receive",
            data : {'sku':_sku,'storageId':storageId,'actCode':actCode},
            dataType : 'json',
            success : function(data) {
                if(data.ret == 1){//领取成功
                    _this.next('.receiveTips').show();
                }else{//领取失败
                    _this.next('.receiveTips').text(data.msg).show();
                }
            }
        });
    });

    //===========我的收藏+助力免单专区页面分享===========//
    NS['share'] = {
        'init':function(){
            _this = this;
            $(document).on('click','.share_pic i',function () {
                var urlLink = $(this).parent('.share_pic').data('url');
                _this.execute($(this).data('name'),urlLink);
            });
        },
        'execute':function(name,url){
            console.log(url);
            window.open("https://api.addthis.com/oexchange/0.8/forward/"+name+"/offer?url=" + url + "&pubid=ra-5688799e3f7e90e3&ct=1&title=&pco=tbxnj-1.0", "height=500px, width=750px, top=150px, left=250px, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no");
        }
    };
    return NS;
})(window.TT_NS || {}, jQuery);
TT_NS.share.init();


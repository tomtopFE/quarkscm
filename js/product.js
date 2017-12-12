//新版tab切换
$(function () {
    $('body').on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        e.preventDefault()
        //获取当前的tab
        var original_selector = $("#nav-box li.active a").attr('href')
        var selector;
        selector = $(this).attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        if (selector != original_selector) {
            $(this).tab('show')
            if (selector == '#estimate_order_cost') {
                $(".js_estimate").trigger('click')
            }
        }

    })
    $(".js_estimate").on("click", function () {
        //验证登录
        //计算运费
        estimate(this);
    })
    //点击删除sku
    $(".sku-delet").on("click", function () {
        $(this).parent().next().remove();
        $(this).parent().remove().next().remove();
    });

    //添加sku
    $(".add-sku").on("click", function () {
        var _html = "<li class='shipping-left'>" +
            "<span class='shipping-checkbox'><input type='checkbox' /></span>" +
            "<div class='shipping-tip sku-delet'>x</div>" +
            "<div class='shipping-content'>" +
            "<p><span class='sku-span lf'>SKU:</span><input type='text' class='sku-input lf'></p>" +
            "<div class='sku-number'>" +
            "<span class='lf'>Qty</span>" +
            "<span class='sku-dis lf'>-</span>" +
            "<input type='text' class='lf' value='1'/>" +
            "<span class='sku-add lf'>+</span>" +
            "</div></div></li>" +
            "<li class='shipping-right'><span>+</span></li>";
        $(this).parent().before(_html);
        //点击删除sku
        $(".sku-delet").on("click", function () {
            $(this).parent().next().remove();
            $(this).parent().remove().next().remove();
        });
        $('.sku-dis').on('click', function () {
            var _inputVal = $(this).next().val();
            _inputVal--;
            _inputVal = _inputVal < 2 ? 1 : _inputVal;
            $(this).next().val(_inputVal);
        })
        $('.sku-add').on('click', function () {
            var _inputVal = $(this).prev().val();
            _inputVal++;
            $(this).prev().val(_inputVal);
        })
    });

    //sku数量增减
    $('.sku-dis').on('click', function () {
        var _inputVal = $(this).next().val();
        _inputVal--;
        _inputVal = _inputVal < 2 ? 1 : _inputVal;
        $(this).next().val(_inputVal);
    })
    $('.sku-add').on('click', function () {
        var _inputVal = $(this).prev().val();
        _inputVal++;
        $(this).prev().val(_inputVal);
    })
})
$.fn.tab = function (option) {
    return this.each(function () {
        var $this = $(this),
            data = $this.data('tab')
        if (!data) $this.data('tab', (data = new Tab(this))) //实例化构造器
        if (typeof option == 'string') data[option]() //执行option的方法
    })
}
var Tab = function (element) {
    this.element = $(element)
}
Tab.prototype.show = function () {
    var $this = this.element,
        $ul = $this.closest('ul:not(.dropdown-menu)') //找到最近的不是dropdown类的ul元素
        ,
        selector = $this.attr('data-target'),
        previous, $target
    //获取与a标签对应的内容id
    if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }
    //如果一直点击自己，这句之后的代码将不执行
    if ($this.parent('li').hasClass('active')) return

    previous = $ul.find('.active a').last()[0] //获得拥有active类的原生a标签对象，即上一次高亮的节点

    $this.trigger({
        type: 'show',
        relatedTarget: previous
    })

    $target = $(selector) //获得内容节点的jQueryDOM对象

    this.activate($this.parent('li'), $ul) //tab页切换


    this.activate($target, $target.parent(), function () {
        $this.trigger({
            type: 'shown',
            relatedTarget: previous
        })

    })
    // this.scroll($target)
}
Tab.prototype.activate = function (element, container, callback) {

    var $active = container.find('> .active'),
        transition = callback &&
            $.support.transition //需要引入其他js文件，这里没有引入。
            &&
            $active.hasClass('fade')

    function next() {
        $active
            .removeClass('active')
            .find('> .dropdown-menu > .active')
            .removeClass('active')

        element.addClass('active')

        if (transition) {
            element[0].offsetWidth // reflow for transition
            element.addClass('in')
        } else {
            element.removeClass('fade')
        }

        if (element.parent('.dropdown-menu')) {
            element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
    }

    transition ?
        $active.one($.support.transition.end, next) :
        next()

    $active.removeClass('in')
}
//页面滚动到内容可显位置
Tab.prototype.scroll = function (element, container, callback) {
    var a = element.offset().top - $(window).scrollTop(),
        b = $("#nav-container").outerHeight()
    if (a < b) {
        $("html,body").animate({scrollTop: element.offset().top - b}, 500); //1000是ms,也可以用slow代替
        // window.scrollTo(0, element.offset().top - b);//1000是ms,也可以用slow代替
    }
}
Tab.prototype.loadContent = function (element, container) {

}
//tab浮动
// $(window).on("scroll", function(a) {
//   var b = $(document).scrollTop(),
//     c = $("#nav-container");
//   b >= $(".js_navRef").offset().top ? (c.css({ position: "fixed", top: 0 })) : (c.css({ position: "relative", top: "0", width: "1200px" }))
// })

function estimate(a) {
    var q = $("#estimate-form"), b = $(a), warehouse_name = $("#warehouse").find("option:selected").html();
    $.ajax({
        url: $.trim(b.attr("data-req-url")),
        type: "POST",
        dataType: "json",
        data: q.serialize() + "&warehouse_name=" + warehouse_name,
        beforeSend: function () {
            // dialog.wait(),
            showMask()
            b.addClass("btn-disable")
        }
    }).done(function (a) {
        hideMask(), b.removeClass("btn-disable")
        if (a.status == 0 || a.status == 1) {
            if (a.data.result_title) {
                $(".result_title").html(a.data.result_title);
            }
            var c = a.data.orderCost.length,
                e = "",
                f = "",
                g = "",
                h;
            shippingStr2 = "",
                pointsCheck = $("#pointsCheck").prop("checked") ? "table-cell" : "none",
                platExpressChargeTitle = "",
                platExpressChargeData = "",
                orderCost = a.data.orderCost,
                orderCost2 = a.data.orderCost2,
                $js_showTable = $(".js-showTable"),
                $js_orderCost = $(".js_orderCost"),
                $js_orderCost2 = $(".js_orderCost2"),
                $shippingCostWrap = $("#shipping-cost-wrap"),
                $shippingCostWrap2 = $("#shipping-cost-wrap2"),
                $js_zipInputWrap = $(".js-post-input-wrap"),
                $(".js_itemSubTotal").attr("orgp", a.data.itemsSubTotal),
                $(".js_handlingFee").attr("orgp", a.data.handlingFee),
                $(".js_packageSubTotal").attr("orgp", a.data.packageSubTotal);
            if (orderCost.length > 0) {
                //取一个结果
                h = a.data.orderCost[0];
                for (var i = 0; i < c; i++) {
                    e += "<tr>" + (a.data.orderCost[i].track_url.length > 0 ? '<td><a target="_blank" href="' + a.data.orderCost[i].track_url + '">' + a.data.orderCost[i].new_shippingMethod + "</a></td>" : "<td>" + a.data.orderCost[i].new_shippingMethod + "</td>") + "<td>" + a.data.orderCost[i].platformCode + "</td>" + "<td>" + a.data.orderCost[i].shipping_type + "</td>" + '<td class="shipping-sub-total">' + '<span class="my_shop_price" orgp="' + a.data.orderCost[i].shippingSubTotal + '"></span>' + "</td>" + '<td><span class="my_shop_price" orgp="' + a.data.orderCost[i].quarkscm_price + '"></span></td>' + '<td><span class="my_shop_price" orgp="' + a.data.orderCost[i].insurance + '"></span></td>' + '<td>- <span class="my_shop_price" orgp="' + a.data.orderCost[i].memberShipDiscount + '"></span></td>' + '<td><span class="my_shop_price" orgp="' + a.data.orderCost[i].thirdPlatProfit + '"></span></td>' + '<td><span class="my_shop_price" orgp="' + a.data.orderCost[i].yourPlatProfit + '"></span></td>' + '<td><span class="my_shop_price" orgp="' + a.data.orderCost[i].total + '"></span></td>' + "</tr>"
                }
            }
            //填充计算公式
            var d = $(".current_currency label").html() + ' ';
            $("#item-cost").val(d + a.data.itemsSubTotal), $("#shipping-cost").val(d + h.shippingTotal), $("#handing-fee").val(d + (a.data.handlingFee * 1 + a.data.packageSubTotal * 1).toFixed(2)), $("#result-price").val(d + h.total)
            $js_orderCost.html(e), $(".js_pointsColumn").css("display", pointsCheck), $js_showTable.show(), $js_zipInputWrap.hide(), $shippingCostWrap.html(g), handle(), $(".estimate").show()
            //没有匹配到，显示所有， shippingmethod改为All
            if (a.status == 1) {
                // var options = $("#shipping-method").find("option");
                // options.attr("selected", false);
                // options.first().attr("selected", true);
                $("#shipping-method").select2("val", [""]);
            }
        } else {
            if (a.msg == 'isGuest') {
                window.location.href = currentBaseUrl + "/customer/account/login";
            } else {
                $(".estimate").hide()
                // alert(content);
            }
        }
        // alert()
        // dialog.close(), dialog.msg(a.msg), $(".estimate").hide(), b.removeClass("btn-disable")
    })
}

function handle() {
    var a = $("body").find(".my_shop_price"), d = $(".current_currency label").html();
    a.each(function (a, b) {
        var g = $(b),
            h = g.attr("orgp");
        g.html(h),
        isNaN(h) || g.prepend(d + " ")
    })
}

$(".js_showtable").on("mouseover", ".js_toggleShippingCost", function () {
    var a = $(this),
        b = a.offset().top + a.outerHeight(),
        c = a.closest(".js_showtable").is(".js-showTable") ? $("#shipping-cost-wrap").find(".shipping-cost_" + $(this).attr("name")) : $("#shipping-cost-wrap2").find(".shipping-cost_" + $(this).attr("name"));
    isNaN(a.attr("orgp")) || c.show().offset({
        top: b
    })
}).on("mouseleave", ".js_toggleShippingCost", function () {
    var a = $(this),
        b = a.closest(".js_showtable").is(".js-showTable") ? $("#shipping-cost-wrap").find(".shipping-cost_" + $(this).attr("name")) : $("#shipping-cost-wrap2").find(".shipping-cost_" + $(this).attr("name"));
    b.hide()
})
var q = $("#estimate-form"),
    r = $("#warehouse"),
    s = $("#shipping-country"),
    t = $("#shipping-method"),
    u = $(".js_addNewSku"),
    v = $(".js_extraGoods");
//平台select切换效果
var platform_map = {"other":5,"Shopify":8,"amazon":15,"ebay":15,"aliexpress":8,"wish":10,"Walmart":12,"11street":10,"cdiscount":10,"DHgate":8,"Jumia":10,"Kilimall":10,"Lazada":10,"LINIO":10,"Newegg":10,"newegg asian":10,"Paytm":10,"Priceminister":10,"sears.com":10};
if(platform_map){
    $("#estimate-form").on("change", "#platform", function () {
        $("#thrdPltfrm_fee").val(5);
        $.each(platform_map, function(platform_code, platform_fee){
            if(platform_code == $("#platform").val()){
                $("#thrdPltfrm_fee").val(platform_fee);
                return;
            }
        })
    });
}

//仓库
$("#estimate-form").on("change", "#warehouse", function (a) {
    t.html('<option value=""></option>');
    $.ajax({
        url: $.trim(r.attr("data-req-url")),
        type: "POST",
        dataType: "json",
        data: {
            platform: $("#platform").val(),
            wid: r.val(),
            listing_id: $("#listing_id").val(),
            totalPrice: $("#totalPrice").val(),
        }
    }).done(function (a) {
        if (a.status == 0) {
            var b,
                c = a.data.country.options,
                e = a.data.shipping.options,
                f = "",
                g = '<option value="" selected="selected">All</option>',
                h = a.data.goods;
            if (typeof c == "object")
                for (b in c)
                    b !== undefined && (f += '<option value="' + b + '"' + (b == a.data.country.is_selected ? ' selected="selected"' : "") + ">" + c[b] + "</option>");
            $("#shipping-country").html(f);
            if (typeof e == "object")
                for (b in e)
                    b !== undefined && (g += '<option value="' + b + '">' + e[b] + "</option>");
            $("#shipping-method").html(g)
        } else {
            // $(".js_estimate").attr("disabled",true);
        }
        // alert()
        // dialog.msg(a.msg)
    })
})
$("#estimate-form").on("change", "#shipping-country", function (a) {
    t.html('<option value=""></option>');
    $.ajax({
        url: $.trim(s.attr("data-req-url")),
        type: "POST",
        dataType: "json",
        data: {
            platform: $("#platform").val(),
            wid: r.val(),
            country: s.val(),
            listing_id: $("#listing_id").val(),
            totalPrice: $("#totalPrice").val(),

        }
    }).done(function (a) {
        if (a.status == 0) {
            // $(".js_estimate").attr("disabled",false);
            var b = a.data.shipping.length,
                c = '<option value="">All</option>';
            for (var d = 0; d < b; d++)
                c += '<option value="' + a.data.shipping[d].code + '">' + a.data.shipping[d].new_name + "</option>";
            t.html(c)
        } else {
            // $(".js_estimate").attr("disabled",true);
        }
        // alert()
        // dialog.msg(a.msg)
    })
})
$(".estimate-item").on("change", "#platform_Fee", function (a) {

    $("#thrdPltfrm_fee").val($("#platform_Fee").val());
})

function estimateLoading() {
    showMask()
}

function showMask() {
    $("#mask").css("height", $(document).height());
    $("#mask").css("width", $(document).width());
    $("#mask").show();
}

//隐藏遮罩层
function hideMask() {
    $("#mask").hide();
}

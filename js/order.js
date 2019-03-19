$.putJSON = function(url, data, success) {
    $.ajax({
        url : url,
        type : 'PUT',
        data : JSON.stringify(data),
        success : success,
        headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json'
        }
    });
};
$.postJSON=function(url,data,success){
    $.ajax({
        url : url,
        type : 'POST',
        data : JSON.stringify(data),
        success : success,
        headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json'
        }
    });
};

var changeAddress = function (address_id) {
    $(".ns_address_list").attr("data-adders-id", address_id);
    $("#address_id").val(address_id)
}

//错误提示
var errorTip = function(tip){
    var errorBox = $('#errorBox');
    $('#errorBoxOkBtn').on("click",function() {
        errorBox.hide();
    });
    errorBox.find('.btn_pop_close').on("click",function() {
        errorBox.hide();
    });
    $('#errorBoxTxt').text((tip || ''));
    errorBox.show();
}
// var order=$.parseJSON($("#json").attr("confirminfo")||"{}");//所有后台返回参数
var findSelectVal=function(){
    var shipping_addressid=$("#ship_address_ul").attr("data-adders-id");//收货地址id

    var shipping_method=$.parseJSON($("#shipping_method").attr("data")||"null");//物流方法

    var pay_method=$(".payment_method_con li:visible [type='radio']").val();//选中的支付方法
    // 支付额外字段
    var extraParas = {};
    $(".payment_method_con .extraParas."+pay_method).each(function(index, domEle){
        var $domEle = $(domEle);
        extraParas[$domEle.attr("name")] = $domEle.val()||$domEle.text();
    });

    var storageid = $("body").attr("storageid");
    var leaveMessage=$(".newshopping_message").find("[name=message]").val();

    //选中的账单地址id
    var billAddrId = $(".payment_method_con li:visible").find(".ns_address_list").attr("data-adders-id");

    var findBilladdres=function(id){
        if(order&&order.billaddres)
            for(var key in order.billaddres){
                var addres=order.billaddres[key];
                if(id==addres.id)
                    return addres;
            }
        return {isNull: true};
    };
    var findShipaddres=function(id){
        if(order&&order.shipaddres)
            for(var key in order.shipaddres){
                var addres=order.shipaddres[key];
                if(id==addres.address_id)
                    return addres;
            }
        return {isNull: true};
    };

    var findadder=function(id){
        // var adder=findBilladdres(id);
        // if(!adder.isNull)
        //     return adder;
        return findShipaddres(id);
    };
    //优惠信息查询
    var loyaltyInfo = order.discounts;
    var point=$.parseJSON($("body").attr("loyalty-point")||"null");
    var tuiguangma=$.parseJSON($("body").attr("loyalty-tuiguangma")||"null");
    var coupon=$.parseJSON($("body").attr("loyalty-coupon")||"null");
    var billAddr_data = findadder(billAddrId);
    var billulAddr = $(".ns_address_list:not(#ship_address_ul)").attr("data");
    var addres = $.parseJSON($("#ship_address_ul .sel").attr("data")||"null");
    return {
        "order" : order,
        "isjpy": order.currency=='JPY',
        "addres" : addres,//收货地址对象
        "billAddr_data":billAddr_data,//账单地址对象
        "shipping_method" : shipping_method,//物流方式对象
        "pay_methord" : pay_method,//支付id
        "leaveMessage" : leaveMessage,
        "findAdder": findadder,//获取地址信息
        "loyaltyInfo": loyaltyInfo,
        "storageid" : storageid,
        "extraParas": JSON.stringify(extraParas),
        "point":point,
        "tuiguangma":tuiguangma,
        "coupon":coupon,
        "isEC":order.source=="BYEC",
        "isRE":order.source=="RETRY"
    };
}
var page = findSelectVal();
//更新显示的地址
var getVal =function(data,dname){
    if(!dname||!data)
        return null;
    var dnames=dname.split('.');
    for(var id in dnames){
        data=data[dnames[id]];
        if(!data||typeof data != 'object')
            return data;
    }
    return data;
};
//更改显示
var updateShow=function(node,json){
    $(node).find("[data-name]").each(function(){
        var dname=$(this).attr("data-name");
        var val=getVal(json,dname);
        val=(val!=0&&!val)?"":val;
        $(this).text(val).val(val);
    });
};

//校验
var showAddresErrText = function(name){
    var checkNode = $('#addShipAddressForm').find('input[data-name='+name+']');
    var value = checkNode.val();
    if((!value&&name!='id'&&name!='addressid')||('telephone' == name &&!(/^[\d]{6,30}/gi.test(value)))){
        findErrNode(checkNode,0).show();
        findErrNode(checkNode,0).parents('.address_input_item').addClass('error');
        return true;
    }else{
        findErrNode(checkNode,0).hide();
        findErrNode(checkNode,0).parents('.address_input_item').removeClass('error');
        return false;
    }
}
var findErrNode=function(node,s){
    s=s||0;
    node=$(node);
    var errornode=node.siblings(".error_msg");
    if(errornode&&errornode[0])
        return errornode;
    if(s<4)
        return findErrNode(node.parent(),++s);
    return errornode;
}
//校验地址在提交前
var verifyAddress=function(data){
    var pass=true;
    var required = ["email","first_name","last_name","street1","city","zip","telephone","country"];
    for(var name in data){
        if(required.indexOf(name)>-1 &&!data[name]){
            if(!!(showAddresErrText(name))&&pass){
                console.log("校验未通过 name=",name," value=",data[name]);
                pass=false;
            }
        }
    }
    if(!(/^[\d]{6,30}/gi.test(data["telephone"]))){
        if(!!(showAddresErrText("telephone"))&&pass){
            console.log("校验未通过 name=telephone  value=",data["telephone"]);
            pass=false;
        }
    }
    //判断省份是否必填
    if($("#addShipAddressForm").find("[data-name=province]").siblings("h5").find("i").length > 0){
        if(!data["province"] && !!(showAddresErrText("province"))){
            pass=false;
        }
    }
    return pass;
};

//新增、更新地址
var updateAdder = function(data){

    $("#pop_address").hide();
    if(data.ret!="1") return errorTip(data.errMsg);
    var result = data.data;
    var fpv=findSelectVal();
    var oldadder=fpv.findAdder(result.address_id);

    if(!oldadder.isNull){
        for(var k in oldadder )
            delete oldadder[k];
        $.extend(oldadder,result);
    }else{
        fpv.order.shipaddres.push(result);
    }
    refershAddress();
    ajaxreflush();
}
//刷新地址
var refershAddress = function(){
    var fpv = findSelectVal();
    var	shipaddres = fpv.order.shipaddres;
    var	billaddres = fpv.order.billaddres;
    var defaultAddr = [];
    var showAdd = true;//是否展示新增地址按钮
    //选中的支付方式
    var payMethod = fpv.pay_methord;
    //选中的账单节点
    var selectPayNode = null;
    $("input[type=radio]:not([value=paypal])").each(function(){if($(this).val()==payMethod) selectPayNode = this;})
    //判断选中账单地址中的对号是否存在
    var selectP = $(selectPayNode).siblings().find(".billing_address span");
    var selectPNode = selectPayNode==null? false : !selectP.hasClass("sel")
    //刷新收货地址所在的UL 先清除在添加
    newsAddress(shipaddres,"#ship_address_ul",showAdd);
    //页面上选中的收货地址
    var selectShipAddr = $.parseJSON($("#ship_address_ul").find(".sel").attr("data"));
    //如果有默认的就放入如果没有就放入物流地址的第一个 如果页面有修改默认就按页面修改的
    var defaultAddrEle = selectShipAddr||shipaddres[0];
    shipaddres.forEach(function(ship,index){
        if(ship.defaultval) defaultAddrEle =ship;
    })
    defaultAddr.push(defaultAddrEle);
    if(selectPNode){
        //如果不存在 将body中的账单信息放入该UL中
        newsAddress(billaddres,$(selectPayNode).siblings().find(".ns_address_list"),showAdd);
    }else{
        //如果存在就将收货地址中默认的地址信息放入账单地址中
        showAdd = false;
        newsAddress(defaultAddr,$(selectPayNode).siblings().find(".ns_address_list"),showAdd);
    }
}
var newsAddress=function(address_list,addresNode,showAdd){
    var addresNodes=$(addresNode);
    addresNode=$(addresNodes[0]);
    var ohternode=addresNodes.not(addresNode);
    if(ohternode&&ohternode[0])
        newsAddress(address_list,ohternode,showAdd);//????递归调用
    var addersid=addresNode.attr("data-adders-id");
    var addAddresNode=$("#ship_to_new_address").clone().show();//添加地址按钮
    addresNode.html($("#ship_address_ul .template").prop("outerHTML"));
    var onenewnode;
    var addrNum=0;
    address_list.forEach(function(addressVal){
        // if(addrNum > 4) return false;
        addrNum++;
        var newnode= $("#ship_address_ul .template").clone().show().removeClass("template");
        if(!onenewnode||addressVal.address_id==addersid)
            onenewnode=newnode;
        updateShow(newnode,addressVal);
        newnode.attr("data",JSON.stringify(addressVal));
        if(addressVal.isocountry != null){
            newnode.find("[data-name=countryName]").text(addressVal.isocountry.name);
        }
        addresNode.append(newnode);
    })
    $(onenewnode).siblings("li:not(#ship_to_new_address)").removeClass("sel").find("[name=shipAddressEdit]").hide();
    $(onenewnode).addClass("sel").find("[name=shipAddressEdit]").show();
    var onenewnodeData = $(onenewnode).attr("data");
    var dataId="";
    if(onenewnodeData)
        dataId =  $.parseJSON($(onenewnode).attr("data")).address_id
    $(onenewnode).parent(".ns_address_list").attr("data",onenewnodeData)
    changeAddress(dataId)
    if(showAdd==false){
        addresNode.find("[name=shipAddressEdit]").hide();
        addAddresNode.hide();
    }
    addresNode.append(addAddresNode);
    // if(!page.isEC && addrNum<5)
    //     addresNode.append(addAddresNode);
    // if(page.isRE){
    //     $("#ship_address_ul").find("[name=shipAddressEdit]").hide();
    //     $("#ship_address_ul").find(".add_item").hide();
    // }
    return onenewnode;
};
//弹出框各个input的验证
$('#addShipAddressForm').find('input[data-name]').not('.current_province').blur(function() {
    var name = $(this).attr('data-name');
    showAddresErrText(name);
});
$(function(){

    $(".ns_address_list").on("click","#ship_to_new_address",function(){
        var type = $(this).parents(".ns_address_list").attr("data-addr-type");
        type = type=="ship"?type:"";
        $("#pop_address").attr("type",type);
        $("#pop_address").show().find(".error_msg").hide();
        updateShow("#pop_address","{}");
        countryValue_old="";
        $("#input_current_province").off().removeAttr("readonly");
        $("#province_list_id").hide();
        $("#div_province_id").hide();
        if(order.shipaddres.length>0) {
            $("#cancel_btn").show();
        }else{
            $("#cancel_btn").hide();
        }
    })
    var countryPlugin = $('.country_list').country();

    if(order.shipaddres.length<1) {
        $(".ns_address_list #ship_to_new_address").click();
        $(".ns_address_list #ship_to_new_address").trigger('click');
        $("#cancel_btn").hide();
    } else{
        //如果没有默认的物流就默认选中第一个展示的物流地址
        if(!$("#ship_address_ul .sel")[0]) {
            $("#ship_address_ul>li:eq(0)").addClass("sel");
        };
    }
    $(".ns_address_list").on("click","li:not(#ship_to_new_address)",function(){
        // $(this).parent(".ns_address_list").attr("data",$(this).attr("data"))
        var address_id = $.parseJSON($(this).attr("data")).address_id
        changeAddress(address_id)
        refershAddress();
        ajaxreflush()
    });

    //点击编辑按钮时执行
    $(".ns_address_list").on("click",".a_edit",function(){
        $("#pop_address").show().find(".error_msg").hide();
        $("#cancel_btn").show();
        openNode=$(this).parents("li[data]:eq(0)");
        if(!openNode) return console.log("查询的元素节点不存在");
        var json= $.parseJSON($(openNode).attr("data")||"{}");
        if(!json.country || json.country=="" || json.isocountry == null){
            json.countryName="";
        }else{
            json.countryName = json.isocountry.name;
        }

        $("body").attr("oldCountry",json.countryName);
        $('.country_list li').each(function(){
            var text = $(this).text();
            if(json.isocountry != null && json.isocountry.name == text){
                $(this).trigger('click');
                $("#province_list_id").hide();
                return;
            }
        });
        updateShow(".newshopping_address_pop",json);
    });
    //点击取消按钮
    $("#cancel_btn").on("click",function(){
        $(".blockPopup_box").hide();
        $("body").attr("oldCountry","");
    })
    //选择国家
    $("li[name=country_li]").on("click" ,function(){
        //更新国家框上隐藏域标签的值
        var self=$(this);
        $("#addShipAddressForm .newshopping_address_country [data-name]").map(function(key,node){
            var name=$(node).attr("data-name");
            var val= self.attr(name);
            if(val)
                $(node).val(val).text(val);
        });
        $("#addShipAddressForm [data-name=telephone]").val(self.attr("areaCode"));
        self.closest(".address_input_item").find(".error_msg").hide();
        self.closest(".address_input_item").removeClass("error");

        var countryValue = self.attr("country_id");
        if(!countryValue||countryValue=="") return;
        else $("#input_current_province").off().on("click",function(){$("#province_list_id").show();});
        //根据选中国家，联动省
        // 根据国家联动省的功能先注释
        $.get("/checkout/onepage/ajax-privince?id="+countryValue+"&timestamp="+new Date().getTime(),function(data) {
            if(data.ret!="1") return console.log("查询id="+countryValue+"的国家的省份失败");
            $("li[name=province_li]").not(".template").remove();
            $("#input_current_province").attr("readonly","readonly");
            if(data.data&&data.data[0]){
                //如果没有*号则新增
                if($("#addShipAddressForm").find("[data-name=province]").siblings("h5").find("i").length < 1){
                    $("#addShipAddressForm").find("[data-name=province]").siblings("h5").prepend("<i>*</i>");
                }
                var oldprovince = $("#input_current_province").val();
                var provinceOption= "";
                var templateNode = $("#province_list_id .template");
                $("#div_province_id").show();//州下拉按钮显示
                var oneLiNode;
                $.each(data.data, function(j,pitem){
                    var liNode = templateNode.clone()
                        .show().removeClass("template")
                        .click(selectProvince)
                    $(liNode).find("span").attr("value",pitem.id).text(pitem.name);
                    $("ul[name=province_list]").append(liNode);
                    if(oldprovince == pitem.name || oldprovince==pitem.shortname){
                        provinceOption = pitem.name;
                    }
                });
                $("#input_current_province").val(provinceOption);
            }else{
                $("#div_province_id").hide();
                $("#province_list_id").hide();
                $("li[name=province_li]").not(".template").remove();
                $("#input_current_province").removeAttr("readonly").off();
                $("#addShipAddressForm").find("[data-name=province]").siblings("h5").find("i").remove();
                $("#addShipAddressForm").find("[data-name=province]").siblings(".error_msg").hide();
            }
        });
    });
    //省份标签点击事件 执行后将标签value放入input中
    var selectProvince = function(){
        var provinceText = $(this).find("span[name=province]").text();
        var cprovince = $(this).parent().siblings('input[type="text"]');
        cprovince.val(provinceText);
        cprovince.closest(".address_input_item").find(".error_msg").hide();
        cprovince.closest(".address_input_item").removeClass("error");
        $(this).parent(".province_list").hide();
    }
    //切换州,点击三角会将省份显示,再次点击取消
    $("#div_province_id").on("click", function(){
        $("li[name=province_li]").show();
        $("#province_list_id").toggle();
    })

    //点击保存地址
    $("#step2_ok_btn").on("click",function(){
        var data = {};
        $("#pop_address [data-name]").map(function(key,node){
            if($(node).attr("data-name"))
                data[$(node).attr("data-name")]=$(node).val();
        });
        if(!verifyAddress(data))
            return false;
        if(!data.id){
            $.postJSON("/customer/address/ajax-save", data ,updateAdder);//新增地址
        }else
            $.putJSON("/customer/address/ajax-save", data ,updateAdder);//更新地址

    })
});
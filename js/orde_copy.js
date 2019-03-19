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
//支付方式 切换特效
$(document).on('click','.payment_method_tab li',function () {
    var dataValue=$(this).attr("data-value")
    $(this).siblings().removeClass("sel");
    $(this).addClass("sel");
    $(".payment_method_con>li").hide();
    $(".payment_method_con>li."+dataValue).show();
    installmentpay();
});
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
var order=$.parseJSON($("body").attr("confirminfo")||"{}");//所有后台返回参数
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
				if(id==addres.id)
					return addres;
			}
		return {isNull: true};
	};
	
	var findadder=function(id){
		var adder=findBilladdres(id);
		if(!adder.isNull)
			return adder;
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
//更新body的confirminfo属性的值 ：更新折扣信息
var updateConfirmInfo = function(data,type){
	var fpv = findSelectVal();
	var newDiscount = {"discount":"","code":"","type":""};
	// 去除折扣
	fpv.order.discounts.forEach(function(discount,index){
		if(discount.type==type) {
			fpv.order.discounts.splice(index,1);
			fpv.order.discount = fpv.order.discount-discount.discount;
		}
	});
	// 添加折扣
	if(data!=null){
		newDiscount.discount = data.discount;
		newDiscount.code = data.code;
		newDiscount.type = data.type;
		fpv.order.discounts.push(newDiscount);
		fpv.order.discount =fpv.order.discount+newDiscount.discount;
	}
	fpv.order.discountStr = fpv.order.discount.toString();
//	$("body").attr("confirminfo",JSON.stringify(fpv.order));
}
//更改显示
var updateShow=function(node,json){
	$(node).find("[data-name]").each(function(){
		var dname=$(this).attr("data-name"); 
		var val=getVal(json,dname);
		val=(val!=0&&!val)?"":val;
		$(this).text(val).val(val);
	});
};

var maxFreeShipping = 0;
var benefitShipping = function(order){
	var choiceFreeShipping = $("input[name='choiceFreeShipping']");
	//先还原所有金额
	order.discount = Number(order.discount) + Number(maxFreeShipping);
	order.discountStr = Number(order.discountStr) + Number(maxFreeShipping);
	order.totalStr = Number(order.totalStr) + Number(maxFreeShipping);
	maxFreeShipping = 0;
	
	//使用免邮权益
	if(choiceFreeShipping.is(':checked') && order.maxFreeShipping > 0 && order.shippingpriceStr > 0){
		maxFreeShipping = order.maxFreeShipping < order.shippingpriceStr ? order.maxFreeShipping : order.shippingpriceStr;
		order.discount = Number(order.discount) - Number(maxFreeShipping);
		order.discountStr = Number(order.discountStr) - Number(maxFreeShipping);
		order.totalStr = Number(order.totalStr) - Number(maxFreeShipping);
	}
	if(order.shippingpriceStr > 0){
		choiceFreeShipping.parent(".freeShipping").show();
	}else{
		choiceFreeShipping.parent(".freeShipping").hide();
	}
}

var oldSubtotal = 0;
//更新价格显示
var updatePricePanel=function(){
	var fsv=findSelectVal();
	var order=fsv.order;
	var sm=fsv.shipping_method;
	//如果已经有优惠金额，且不是免运费券，则商品金额必须为非活动商品金额
	if(order.discount < 0 && maxFreeShipping == 0){
		//如果使用了优惠券则需要将商品的活动价格暂存
		if(oldSubtotal == 0){
			oldSubtotal = order.subtotal;
		}
		//使用商品非活动价格
		order.subtotal = order.inactiveSubtotal;
		order.subtotalStr = order.inactiveSubtotal;
	}else if(oldSubtotal > 0){
		//不使用优惠券时需要将商品价格还原为商品活动价格
		order.subtotal = oldSubtotal;
		order.subtotalStr = oldSubtotal;
	}
	
	if(sm&&sm.price){
		order.shippingpriceStr=sm.price;
		order.totalStr=(sm.price+order.subtotal+order.discount) ;
	}else{
		order.shippingpriceStr=order.shippingprice?order.shippingprice:0;
		order.totalStr=(order.shippingpriceStr+order.subtotal+order.discount) ;
	}
	// 货到付款
	if("cash_on_delivery"==fsv.pay_methord){
		order.totalStr+=order.codCost;
	}
	benefitShipping(order);
	order.discountStr=fsv.isjpy? Math.round(order.discountStr)+"": order.discount.toFixed(2)+"";
	order.shippingpriceStr=fsv.isjpy? Math.round(order.shippingpriceStr)+"": order.shippingpriceStr.toFixed(2)+"";
	order.totalStr=fsv.isjpy? Math.round(order.totalStr)+"": order.totalStr.toFixed(2)+"";
	order.total = parseFloat(order.totalStr);
	updateShow(".newshopping_box_right dl",order);
	
	installmentpay();
};
var countryValue_old;
$(function(){
	//点击添加地址按钮
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
	//弹框的国家选项
	var countryPlugin = $('.country_list').country();
	if(order.shipaddres.length<1) {
		$(".ns_address_list #ship_to_new_address").click();
		$("#cancel_btn").hide();
	} else{	
		//如果没有默认的物流就默认选中第一个展示的物流地址
		if(!$("#ship_address_ul .sel")[0]) {
			$("#ship_address_ul>li:eq(0)").addClass("sel");
		};
	}
	//账单地址默认展示跟收货地址相同
	var billAddress = $("#ship_address_ul>li:eq(0)").clone();
	var adder=$("#ship_address_ul>li:eq(0)").attr("data");
	if(adder)
		$("#ship_address_ul").attr("data",$("#ship_address_ul>li:eq(0)")
							 .attr("data")).attr("data-adders-id", $.parseJSON(adder).id);
	if(!page.isEC){
		//点击选择默认收货地址
		$(".ns_address_list").on("click","li:not(#ship_to_new_address)",function(){
			var type = $(this).parent(".ns_address_list").attr("data-addr-type");
			$(this).parent(".ns_address_list").attr("data",$(this).attr("data")).attr("data-adders-id", $.parseJSON($(this).attr("data")).id);
			refershAddress();
			if(type == "ship"){
				refreshPaymentType();
				loadShipMethod();
				updatePricePanel();
			}
		});
	}else{
		loadShipMethod();
		updatePricePanel();
	}
	//物流地址的edit只展示选中的标签
	$("#ship_address_ul .sel").find("[name=shipAddressEdit]").show();
	//默认地址点击一下，加载各种资源
	$("#ship_address_ul>li.sel").click();
	loadPrefer();
//	loadPrivilege();
	//点击编辑按钮时执行
	$(".ns_address_list").on("click",".a_edit",function(){
		var type = $(this).parents(".ns_address_list").attr("data-addr-type");
		type = type=="ship"?type:"";
		$("#pop_address").attr("type",type);
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
		$("#addShipAddressForm .blockPopup_box").hide();
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
		
		var countryValue = self.attr("country");
		if(!countryValue||countryValue=="") return;
		else $("#input_current_province").off().on("click",function(){$("#province_list_id").show();});
		 //根据选中国家，联动省
		 // 根据国家联动省的功能先注释
		 $.get("/order/province/"+countryValue+"?timestamp="+new Date().getTime(),function(data) {
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
	//qiwi支付中的区码选择
	$(".span_qiwi_account").click(function(){
	    $(this).parents(".method_qiwi_account").find(".qiwi_account_list").toggle();
	});
	$('.qiwi_account_list li').click(function(){
		var text = $(this).find('strong').text();
		var cls = $(this).find("i:eq(0)").attr("class");
		$('.qiwi_account_input strong').text(text);
		$('.qiwi_account_list').hide();
		$('input[name=pay_countryCode]').val(text);
		$(".span_qiwi_account i").attr("class", cls);
	});
	//boleto支付中
	$(".boleto_input h5").click(function(){
	    $(this).parents(".boleto_input ul").show();
		
	});
	//点击需要账单地址的两种支付方法刷新地址
	$(document).on('click','.needBill',function () {
		refershAddress();
	});
	
})
	if( page.isEC ){
		//点击保存地址、ec支付需要区别对待,
		$("#step2_ok_btn").on("click",function(){
			var data = {};
			
			$("#addShipAddressForm [data-name]").map(function(key,node){
				data[$(node).attr("data-name")]=$(node).val();					
			})
			data.isocountry={id:data.country,name:data['isocountry.name'],isoCode:data['isocountry.isoCode']}
			if(!verifyAddress(data))
				return false;	
			$("#pop_address").hide();
			updateShow($("#ship_address_ul>li"),data);	
			$("#ship_address_ul>li").attr("data",JSON.stringify(data));
			loadShipMethod();
		})
	}else{
		//点击保存地址
		$("#step2_ok_btn").on("click",function(){
			var data = {};
			$("#pop_address [data-name]").map(function(key,node){
				if($(node).attr("data-name"))data[$(node).attr("data-name")]=$(node).val(); 
			});
			if(!verifyAddress(data))
				return false;
			$("#pop_address").hide();
			if(!data.id){
				if($("#pop_address").attr("type")=='ship'){
					data.addressid=1;
				}else{
					data.addressid=2;//账单地址
				}
				$.postJSON("/addres/", data ,updateAdder);//新增地址
//				// 如果是收货地址且账单地址没有,同步增加一个账单地址
//				if(data.addressid==1 && order.billaddres && order.billaddres.length==0){
//					data.addressid=2;
//					$.postJSON("/addres/", data ,updateAdder);//新增地址
//				}
			}else
				$.putJSON("/addres/", data ,updateAdder);//更新地址
		})
	}
	//新增、更新地址
	var updateAdder = function(data){
		if(data.ret!="1") return errorTip(data.errMsg);
		var result = data.data;
		var fpv=findSelectVal();
		var oldadder=fpv.findAdder(result.id);
		
		if(!oldadder.isNull){
			for(var k in oldadder ) 
				delete oldadder[k];
			$.extend(oldadder,result);
		}else{
			var array=(result.addressid==1?fpv.order.shipaddres:fpv.order.billaddres)||[];
			array.push(result);
		}
		refershAddress();
		if(result.addressid==1){
			refreshPaymentType();
			loadShipMethod();
			updatePricePanel();
		}
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
			if(addrNum > 4) return false;
			addrNum++;
			var newnode= $("#ship_address_ul .template").clone().show().removeClass("template");
			if(!onenewnode||addressVal.id==addersid)
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
			dataId =  $.parseJSON($(onenewnode).attr("data")).id
		$(onenewnode).parent(".ns_address_list").attr("data",onenewnodeData)
												.attr("data-adders-id", dataId);	
		if(showAdd==false){
			addresNode.find("[name=shipAddressEdit]").hide();
			addAddresNode.hide();
		}
		if(!page.isEC && addrNum<5)
			addresNode.append(addAddresNode);
		if(page.isRE){
			$("#ship_address_ul").find("[name=shipAddressEdit]").hide();
			$("#ship_address_ul").find(".add_item").hide();
		}
		return onenewnode;
	};
	//弹出框各个input的验证
	$('#addShipAddressForm').find('input[data-name]').not('.current_province').blur(function() {
		var name = $(this).attr('data-name');
		showAddresErrText(name);
	});
	//账单地址点击展开
	$(".billing_address").on("click",function(){
		var _this = $(this).find("span");
	    if(_this.hasClass('sel')){
	       _this.removeClass("sel");
	    }else{
	       _this.addClass("sel");  
	    }
	    refershAddress();
	})
	//物流
	var trTemplate=$("#shipping_method .template");
	var loadShipMethod=function(){
		// 再次支付不查询物流
		if(page.isRE){
			return;
		}
		var fpv=findSelectVal();
		if(!fpv.order.storageid||!fpv.addres||!fpv.addres.isocountry||!fpv.addres.isocountry.isoCode)
			return console.warn("没有物流地址不可以加载物流方式！");
		//当国家没有变化且商品总价没有变化时不需要重新加载物流
		if(fpv.order.quryBody.country==fpv.addres.isocountry.isoCode && fpv.order.quryBody.totalPrice == fpv.order.subtotal && fpv.order.inactiveSubtotal == fpv.order.subtotal)
			return console.warn("物流地址的国家没有发生改变，不重新加载物流方式！");
		fpv.order.quryBody.country=fpv.addres.isocountry.isoCode;
		fpv.order.quryBody.totalPrice=fpv.order.subtotal;
		$.postJSON("/shippingmethod/qury",fpv.order.quryBody,function(res){
			if(res.ret!="1") return console.error("加载物流方式失败！");
			var data=res.data
			$("#shipping_method").attr("data",JSON.stringify(data));
			$("#shipping_method").html(trTemplate.prop("outerHTML"));
			var availableCount = 0;
			// 重新选中
			var _shippingId = getQueryString("shippingId");
			var shippingId = null;
			data.forEach(function(e){  
				if(e.id==_shippingId){shippingId=e.id}
			})  
			var select=true;
			data.map(function(val,key){
				if("CODType" == val.type && page.isEC){return;}
				var node=trTemplate.clone().removeClass("template");
				node.attr("data",JSON.stringify(val));
				if(val.isShow){
					availableCount++;
					if("SurfaceType" == val.type){
						val.trackable = $("#trackable_no").val();
						node.addClass('sel_a');
					}else{
						val.trackable = $("#trackable_yes").val();
						node.addClass('sel_b');
					}
					if(select){
						if(shippingId==null || shippingId==val.id){
							node.addClass('select');
							$("#shipping_method").attr("data",JSON.stringify(val));
							select = false;
						}
					}
				}else{
					val.price = $("#shippingUnavailable").val();
					node.find("#shipsymbol").hide();
					if("SurfaceType" == val.type){
						val.trackable = $("#trackable_no").val();
						node.addClass('no_a');
					}else{
						val.trackable = $("#trackable_yes").val();
						node.addClass('no_b');
					}
				}
				updateShow(node,val);
				node.show();
				$("#shipping_method").append(node);
			});
			if(availableCount > 0){
				$("#shipwarn").hide();
			}else{
				$("#shipwarn_country").html(" " + fpv.addres.isocountry.name);
				$("#shipwarn").show();
			}
			$('#ns_loading_box').hide();
			if(select && $("#shipping_method tr:not(.no_a , .no_b):visible").length > 0){
				$("#shipping_method tr:not(.no_a , .no_b):visible:first").click();
			}else{
				$("#shipping_method tr.select").click();
			}
		});
	};
	$("#shipping_method").on("click","tr:not(.no_a , .no_b)",function(){
		var d = $('#shipping_method tr.select').removeClass('select');
		$(this).addClass('select');
		$("#shipping_method").attr("data",$(this).attr("data"));
		// 货到付款特殊处理
		refreshCod();
		updatePricePanel();
		//巴西CPF处理，
		var fsv=findSelectVal();
		validateCPF(fsv);
		//防止回车弹黑色背景
		$(this).blur();
	});
	//展示页面优惠券积分，推广码的使用情况
	var showSwitch = function(){
		var fpv = findSelectVal();

		var showcoupon = $("#checkout_coupon_insert li").length>1&&!fpv.tuiguangma;
		var showpromo = !fpv.coupon;

		showLoyalty(fpv);
		showCoupon(fpv,showcoupon);
		showPromo(fpv,showpromo);
		showPoint(fpv);
		
	};
	//刷新页面是否展示优惠券推广码
	var showLoyalty=function(fpv){
		if((!(showLoyalty.prototype.notOne)&&(fpv.coupon||fpv.tuiguangma))||(!!$("body").attr("show-loyalty"))) {
			$("#show_loyalty").find("span").text("-");
			$(".newshopping_box_right .loyalty_div").show()
		} else{
			$("#show_loyalty").find("span").text("+");
			$(".newshopping_box_right .loyalty_div").hide()
		}
		if($("body").attr("show-loyalty"))
			showLoyalty.prototype.notOne=true;
	};
	//展示优惠券
	var showCoupon=function(fpv,showCoupon){
		var coupon = $("#checkout_coupon_div .have_code_input");
		if(showCoupon){
			if(fpv.coupon){
				coupon.show()
				.find("#checkout_coupon_code").off().attr("readOnly",true)
				.parent().siblings("[data-oper='cancel']").show()
				.siblings("[data-oper='apply']").hide();
				$("[data-code='"+fpv.coupon.code+"']").click();
			}else{
				coupon.show()
				.find("#checkout_coupon_code").off().on("click",function(){$("#checkout_coupon_insert").toggle();})
				.attr("readOnly",false)
				.parent().siblings("[data-oper='cancel']").hide()
				.siblings("[data-oper='apply']").show();
			}
		}else{
			coupon.hide();
		}
	};
	//展示推广码
	var showPromo=function(fpv,showPromo){
		var tuiguangma = $("#checkout_promo_div .have_code_input");
		if(showPromo){
			if(fpv.tuiguangma){
				tuiguangma.show()
				.find("#checkout_promo_input").val(fpv.tuiguangma.code).attr("readOnly",true)
				.siblings("[data-oper='cancel']").show()
				.siblings("[data-oper='apply']").hide();
			}else{
				tuiguangma.show()
				.find("#checkout_promo_input").attr("readOnly",false)
				.siblings("[data-oper='cancel']").hide()
				.siblings("[data-oper='apply']").show();
			}
		}else{
			tuiguangma.hide();
		}
	};
	//展示积分
	var showPoint=function(fpv){
		var point = $("#checkout_point_div .have_code_input");
 		if(fpv.point){
 			point.show()
 			.find("#checkout_point_input").attr("readOnly",true)
 			.val(fpv.point.code)
 			.siblings("[data-oper='cancel']").show()
 			.siblings("[data-oper='apply']").hide();
 		}else{
 			point.show();
 			point.find("#checkout_point_input").attr("readOnly",false)
 			.siblings("[data-oper='cancel']").hide()
 			.siblings("[data-oper='apply']").show();
 		}
 		
 		if($("body").attr("show-point")||(!(showPoint.prototype.notOne)&&fpv.point)){
 			$("#point_p").find("span").text("-");
 			$("#checkout_point_div .have_code_input").show();
 		}else{
 			$("#point_p").find("span").text("+");
 			$("#checkout_point_div .have_code_input").hide()
 		}
 		if($("body").attr("show-point"))
 			showPoint.prototype.notOne=true;
	};
	//优惠券推广码点击展开
	$("#show_loyalty").click(function(){
		if($("body").attr("show-loyalty"))
			$("body").removeAttr("show-loyalty")
		else
			$("body").attr("show-loyalty","true")
        showSwitch();
	});
	//点击显示积分框
    $("#point_p").click(function(){
		if($("body").attr("show-point"))
			$("body").removeAttr("show-point")
		else
			$("body").attr("show-point","true")
        showSwitch();
    });
	//取消优惠券积分推广码的使用
	var undoPrefer = function(type,callback,errcallback){
		var fpv=findSelectVal();
		if(!fpv.coupon&&!fpv.tuiguangma&&!fpv.point){
 			return console.log("你没有应用优惠券或者推广码或者积分！");
 		}
		$.get("/loyalty/un?type="+type+"&timestamp="+new Date().getTime(), function(data){
			try{
		    	if(data.ret=="1"){
		    		type.split(',').forEach(function(value){
		    			updateConfirmInfo(null,value);
		    			$("body").removeAttr("loyalty-"+value);
		    		})
		    		showSwitch();
		    		callback&&callback(data);
		    	}else{
		    		errcallback&&errcallback(data);
		    	}
			}finally{
				updatePricePanel();
				updateProductPrice();
				loadShipMethod();
			}
	    	console.log("取消应用推广码优惠券结果",data);
		});
	}
	//cancel按钮
	$(".newshopping_box_right [data-oper=cancel]").on("click",function(){
		var type=$(this).attr("loyaltyType");
		undoPrefer(type);
	})
	//加载优惠券和积分
	var loadPrefer = function(){
		var fpv = findSelectVal();
		if(!fpv.order.storageid){
			return console.log("没有产品,不需要加载优汇信息...");
		}
		$.get("/loyalty/cap?storageid="+fpv.order.storageid+"&currency="+fpv.order.currency+"&timestamp="+new Date().getTime(),function(data){
			if(data.ret=="1"||data.data){
				//积分
				var loyal = data.data;
				$("#cart_usablepoint").text(loyal.point);
				//优惠券
				if(loyal.coupons&&loyal.coupons.length>0){
					$("#checkout_coupon_insert>li:not(.template)").remove();
					var coupon_template = $("#checkout_coupon_insert .template");
					loyal.coupons.forEach(function(coupon){
						try{
							var validEndDate=coupon.validEndDate?new Date(coupon.validEndDate.replace("-", "/").replace("-", "/")):new Date();
							coupon.validDate=validEndDate.toDateString().substring(4);
							coupon.validEndDate=validEndDate;
							var l=2;
							if(coupon.unit=='JPY'){l=0;} 
							coupon.storageid=fpv.order.storageid;
							coupon["show-discount"]=coupon.isCash?(Number(coupon.value).toFixed(l)+" "+coupon.unit):(coupon.value+" off");
							var coupon_node=coupon_template.clone()
							.show().removeClass("template")
							.attr("data-coupon",JSON.stringify(coupon))
							.attr("data-code",coupon.code)
							.attr("data-discount",coupon["show-discount"])
							.text(coupon["show-discount"])
							.click(selectCoupon);
							$("#checkout_coupon_insert").append(coupon_node);
							updateShow(coupon_node, coupon);
						}catch(e){console.error("加载优惠券失败",e)}
					})
				}
				loadPrivilege();
				showSwitch();
			}
		})
	};
	//每个优惠li的单击事件
	var selectCoupon= function(){
		$("#checkout_coupon_insert").hide();
		var discount = $.parseJSON($(this).attr("data-coupon")||"{}")
		$("#checkout_coupon_code")
		.text(discount["show-discount"])
		.attr("data-coupon",$(this).attr("data-coupon"));
	};
	//应用积分、优惠券、推广码
	$(".newshopping_box_right [data-oper=apply]").on("click , keydown",function(){
		var typeNode = $(this);
		var type=typeNode.attr("loyaltyType");
		var readOnlyNode = null;
		if(type == "POINT"){
			readOnlyNode = $("#checkout_point_input");
			var code = readOnlyNode.val();
			var point = ($("#cart_usablepoint").text()*1)||0;
			code = code<0?0:code>point?point:code;
			$("#checkout_point_input").val(code);
			if(code == 0) return; 
		}else if(type == "TUIGUANGMA"){
			readOnlyNode =$("#checkout_promo_input");
			var code = readOnlyNode.val();
			if(!code) return;
		}else if(type == "COUPON"){
			readOnlyNode = $("#checkout_coupon_code");
			var coupon = $.parseJSON(readOnlyNode.attr("data-coupon")||"{}");
			var code = coupon.code;
		}
		applyLoyalty(type,code,readOnlyNode);
	})
	//应用优惠
	var applyLoyalty = function(type,code,readOnlyNode){
		if(code){
			var fpv=findSelectVal();
			if(!fpv.order.storageid){
				return;
			}
			$.get("/loyalty/apply?type="+type+"&code="+code+"&storageid="+fpv.order.storageid+"&currency="+fpv.order.currency+"&timestamp="+new Date().getTime(),function(data){
				if(data.ret == "1"){
					if(data.data.succeed){
						readOnlyNode.attr("readOnly",true);
						readOnlyNode.parents(".have_code_input").find(".error_p").hide()
						$("body").attr("loyalty-"+type,JSON.stringify(data.data));
						showSwitch();
						updateConfirmInfo(data.data,type);
						updatePricePanel();
						updateProductPrice();
						loadShipMethod();
					}else{
						readOnlyNode.parents(".have_code_input").find(".error_p").show().text(data.data.errMsg);
					}
				}
			})
		}
	};
	//限时限量产品使用优惠券之后需要修改产品价格为原价
	var updateProductPrice = function(){
		var fpv=findSelectVal();
		$(".product_list dd").each(function(){
			var product=$.parseJSON($(this).attr("data")||"null");
			if(product == null || product.gatherInactivePrice == product.gatherCurrentPrice){
				return;
			}
			//应用优惠
			if(fpv.point || fpv.tuiguangma || fpv.coupon){
				var updatePrice = {"currentPriceStr":product.price.inactivePriceStr,"gatherCurrentPriceStr":product.gatherInactivePriceStr};
				updateShow($(this),updatePrice);
			}else{
				//取消优惠
				var updatePrice = {"currentPriceStr":product.price.currentPriceStr,"gatherCurrentPriceStr":product.gatherCurrentPriceStr};
				updateShow($(this),updatePrice);
			}
		});
	}
	
	//加载已使用的优惠券	
	var loadPrivilege =function(){
		var fpv=findSelectVal();
		if(!fpv.order.storageid){
			return console.log("没有产品,不需要加载优汇信息...");
		}
		$.get("/loyalty/all"+"?timestamp="+new Date().getTime(),function(data){
			if(data.ret=="1"){
				var body=$("body");
				if(data.data)
					data.data.forEach(function(loyalty){
						body.attr("loyalty-"+loyalty.type,JSON.stringify(loyalty));
						updateConfirmInfo(loyalty,loyalty.type);
					});
				showSwitch();
//				loadPrefer();
			}
			updatePricePanel();
			updateProductPrice();
		})
	};
	//推广码输入框绑定一个focus事件
	$("#checkout_promo_input").on("focus",function(){$(this).siblings(".error_p").hide();})
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
		var required = ["firstname","lastname","streetaddress","city","postalcode","telephone","country"];
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

$(function(){
	
	$('.payment_method_con .extraParas[required]').on('blur',function(){
		if(!$(this).val()){
			$(this).closest("li").find(".error").show();
		}else{
			$(this).closest("li").find(".error").hide();
		}
	});
	
	$('.payment_method_con .extraParas[required]').on('focus',function(){
		$(this).closest("li").find(".error").hide();
	});
	
	var verifyPlaceOrder=function(fsv){
		var pass=true;
		// 验证所有必填项
		$(".payment_method_con .extraParas[required]:visible").each(function(){
			if(!$(this).val()){
				$(this).focus();
				$(this).closest("li").find(".error").show();
				pass = false;
			}else{
				$(this).closest("li").find(".error").hide();
			}
			//如果存在邮箱，需要验证邮箱格式是否正确
			if($(this).hasClass("subEmail") && !/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($(this).val())){
				$(this).focus();
				$(this).closest("li").find(".error").show();
				pass = false;
			}
		});
		//验证CNPJ
		$(".payment_method_con .extraParas.cnpj:visible").each(function(){
			var value = $(this).val();
			//为空则不判断格式是否正确
			if(value && !cnpjcheck(value)){
				$(this).focus();
				$(this).closest("li").find(".error").show();
				pass = false;
			}else{
				$(this).closest("li").find(".error").hide();
			}
		});
		
		// 货到付款验证
		if("cash_on_delivery"==fsv.pay_methord){
			if(cashDelivery){
				pass = cashDelivery.checkAll();
			}
		}
		//再次支付不需要验证物流地址
		if(!page.isRE)
		if(!verifyAddress(fsv.addres || {})){
			$("#ship_address_ul .sel .a_edit").click();
			verifyAddress(fsv.addres || {});
			pass = false;
		}
		//再次支付不需要验证物流方式
		if(!page.isRE)
		if(!fsv.shipping_method||!fsv.shipping_method.code){
			errorTip($("#shipwarn").text());
			pass = false;
		}
		var paymethodId = fsv.pay_methord;
		return pass;
	};
	//获取商品信息
	var findProducts=function(){
		var fsv=findSelectVal();
		var itemids = [];
		fsv.order.cartitems.forEach(function(item) {
			//满减活动
			if(item.items){
				item.items.forEach(function(i){
					itemids.push({"listingid" : i.listingid,"qty" : i.qty,"id" : i.id,"joinActivity":""+i.joinActivity});
				})
			}else{
				itemids.push({"listingid" : item.listingid,"qty" : item.qty,"id" : item.id,"joinActivity":""+item.joinActivity});
			}
		});
		return itemids;
	};
	if(!page.isRE&&!page.isEC)
	//生成订单
	$("#placeYourOrder").on("click",function(){
		var fsv=findSelectVal();
		if(!(verifyPlaceOrder(fsv))){
			return false;
		}
		if(!(validateCPF(fsv))){
			//防止回车弹黑色背景
			$(this).blur();
			return false;
		}
		fsv.addres.vatnumber = $("#user_cpf").val();
		if('paypal'==fsv.pay_methord){
			$('#ns_loading_box_paypal').show();
		}else{
			$('#ns_loading_box').show();
		}
		var submitData={};
		submitData.message = fsv.leaveMessage;
		
		submitData.itemPlaces = findProducts();//商品id
		submitData.shippingAddres = fsv.addres;//收货地址
		if(fsv.billAddr_data)
			submitData.billAddresId =  fsv.billAddr_data.id ;//账单地址
		submitData.shippingcode=fsv.shipping_method.code;//物流code eg: PTU3,UEF.....?
		submitData.shipmethodid=fsv.shipping_method.id;//物流id
		submitData.shippingType=fsv.shipping_method.type;
		submitData.source=fsv.order.source;//页面类型（ec,普通...）
		submitData.storageid=fsv.order.storageid;

		submitData.paymentId=fsv.pay_methord;//支付方式id
		submitData.extraParas = fsv.extraParas;// 支付额外参数
		submitData.choiceFreeShipping = $("input[name='choiceFreeShipping']").is(':checked');
		postJsonForm("/order/place", submitData);
	})
	if( page.isEC )
	$("#placeYourOrder").click(function(){
		//弹出loading
		var fsv=findSelectVal();
		if(!(verifyPlaceOrder(fsv))){
			return false;
		}
		if(!(validateCPF(fsv))){
			//防止回车弹黑色背景
			$(this).blur();
			return false;
		}
		fsv.addres.vatnumber = $("#user_cpf").val();
		$('#ns_loading_box').show();
		var submitData={};
		submitData.token=fsv.order.token;
		submitData.payerId=fsv.order.payerId;
		submitData.from=fsv.order.from;
		
		submitData.message=fsv.leaveMessage;
		submitData.products=findProducts();
		submitData.shippingAddres=fsv.addres;
		submitData.shippingcode=fsv.shipping_method.code;
		submitData.source=fsv.order.source;
		submitData.storageid=fsv.order.storageid;
		submitData.orderNum=fsv.order.orderNumber;
		submitData.email=fsv.addres.memberemail;
			 
		submitData.paymentId=fsv.pay_methord;
		submitData.choiceFreeShipping = $("input[name='choiceFreeShipping']").is(':checked');
		$.postJSON("/order/ec",submitData,function(res){
			$('#ns_loading_box').hide();
			if(res.ret=='1'){
				if(res.data.success){
					location.href="/payment-result/succeed/"+fsv.order.orderNumber;
				}else{
					location.href="/payment-result/error/"+fsv.order.orderNumber+"?errorCode="+res.data.errorCode+"&errorMessage="+res.data.errorMessage;
				}
			}else{
				errorTip(res.errMsg);
			}
		});
	});
	if( page.isRE)
	$("#placeYourOrder").click(function(){//点击提交按钮
		//弹出loading
		var fsv=findSelectVal();
		if(!(verifyPlaceOrder(fsv))){
			return false;
		}
		$('#ns_loading_box').show();
		var submitData={};
		submitData.message=fsv.leaveMessage;
		
		submitData.source=fsv.order.source;
		submitData.orderNum=fsv.order.orderNumber;
		if(fsv.billAddr_data)
			submitData.billAddresId =  fsv.billAddr_data.id ;//账单地址
		submitData.paymentId=fsv.pay_methord;
		submitData.extraParas = fsv.extraParas;// 支付额外参数
		postJsonForm("/order/retry", submitData);
	});
	if( page.isRE){
		$(".view_more_c .view_more").on("click",function(){
			var status=$(this).attr("status"); 
			if(status == "hide"){
				$(this).parents(".newshopping_box_left").find(".product_list>dd").removeClass("product_list_hide");
				$(this).attr("status","show");
			}else{
				$(this).parents(".newshopping_box_left").find(".product_list>dd:eq(0)").nextAll("dd").addClass("product_list_hide");
				$(this).attr("status","hide");
			}
		});
		if($(".product_list>dd").length > 1){
			$(".product_list").siblings(".view_more_c").show();
			$(".view_more_c .view_more").click();
		}else{
			$(".product_list").siblings(".view_more_c").hide();
		}
	}
	
	$('.onlyNub').on('keydown', function (e) {
        if( (e.keyCode < 48 || e.keyCode > 57) & (e.keyCode < 96 || e.keyCode > 105) & (e.keyCode !=8 ) & (e.keyCode != 37) & (e.keyCode != 39) & (e.keyCode != 32) & (e.keyCode != 109)) {
         return false;
         };
     });
});

function postJsonForm(url, json){
	var form=$("<form>").attr("action",url).attr("method","POST");
	jsonToForm(json,"",form);
	$("#submitform").append(form);
	form.submit();
}
	
function jsonToForm(json, path, form){
	for(var key in json){
		if(json[key] instanceof Array){
			for(var index in json[key]){
				jsonToForm(json[key][index], path?path+"."+key+"["+index+"]":key+"["+index+"]", form);
			}
		}else if(json[key] instanceof Object){
			jsonToForm(json[key], path?path+"."+key:key, form);
		}else{
			if(json[key]){
				form.append($("<input>").attr("name",path?path+"."+key:key).attr("value",json[key]));
			}
		}
	}
}

function changeURLParam(url, arg, arg_val) {
	if(!arg_val)return url;
	var pattern = arg + '=([^&]*)';
	var replaceText = arg + '=' + arg_val;
	if (url.match(pattern)) {
		var tmp = '/(' + arg + '=)([^&]*)/gi';
		tmp = url.replace(eval(tmp), replaceText);
		return tmp;
	} else {
		if (url.match('[\?]')) {
			return url + '&' + replaceText;
		} else {
			return url + '?' + replaceText;
		}
	}
	return url + '\n' + arg + '\n' + arg_val;
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}

function addCookie(name, value){  
   if(!value)return;
   var exp = new Date();  
   exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000); //3天过期  
   document.cookie = name + "=" + encodeURIComponent(value) + ";domain=."+$("#hostname").val()+".com;expires=" + exp.toGMTString()+";path=/";  
   return true;  
}

function refreshPaymentType(){
	var skus = [];
	order.cartitems.forEach(function(item) {
		//满减活动
		if(item.items){
			item.items.forEach(function(i){
				skus.push(i.product.sku);
			})
		}else{
			skus.push(item.product.sku);
		}
	});
	var country = $('#ship_address_ul .sel span[data-name="isocountry.isoCode"]').text();
	$.get("/payment/types?country="+country+"&skus="+skus.join(",")+"&timestamp="+new Date().getTime(),function(result){
		$(".payment_method_tab").empty();
		if(result.ret == 1 && result.data){
			for(var i = 0;i<result.data.length;i++){
				var payment = result.data[i];
				if(page.isRE && payment.paymenttype=="oceanpayment_installment"){
					continue;
				}
				$(".payment_method_tab").append($(".payment_method_tab_template li[data-value="+payment.paymenttype+"]").clone());
				$(".payment_method_con>li."+payment.paymenttype).find(".description").text(payment.description);
			}
			$(".payment_method_tab li:visible:first").click();
		}else{
			errorTip(result.errMsg);
		}
	});
}

function installmentpay(){
	var paymentid=$(".payment_method_con li:visible [type='radio']").val();
	//如果是巴西分期付款
	if(paymentid == "oceanpayment_installment"){
		//计算分期价格
		var grandTotal = parseFloat($('#grandTotal').text());
		$("#installment_amount").text(grandTotal.toFixed(2));
		var symbolCode = $("#symbolCode").val();
		var installmentLimit = $("#installmentLimit").val();
		var maxInstallments = $("#maxInstallments").val();
		var pay_installments = 1;
		//计算可分期数
		if(grandTotal > installmentLimit){
			pay_installments = parseInt(grandTotal/installmentLimit);
		}
		//最大期数
		if(pay_installments > maxInstallments){
			pay_installments = maxInstallments;
		}
		var installment_ul = $(".installment_div").find("ul");
		$(installment_ul).empty();
		//利息
		var interestArray = $("#interest").val().split("|");
		//初始化分期选项
		$(".installment_div .option_val em").text("1 x " + grandTotal.toFixed(2) + " " + symbolCode);
		for(var i = 1;i<=pay_installments;i++){
			if(i == 7 || i == 8 || i == 11){
				continue;
			}
			var interest = 0;
			if(interestArray[i]){
				interest = interestArray[i];
			}else if(i >= interestArray.length){
				interest = interestArray[interestArray.length - 1];
			}
			var total = (grandTotal*(1+interest/100)).toFixed(2);
			var installment_amount = Math.round((total/i)*100)/100;
			$(installment_ul).append("<li><em value="+i+" amount="+ installment_amount +" totalAmount="+ total +">"+i+" x "+ installment_amount+" " + symbolCode +" ("+ total + " " + symbolCode +") </em></li>");
		}
    	$(".installment_amount").show();
    }else{
    	$(".installment_amount").hide();
    }
}

var cpfReg = /^((\d{3}\.){2}\d{3}-\d{2}|\d{2}(\.\d{3}){2}\/\d{4}-\d{2})$/;
function validateCPF(fsv){
	if(!fsv.shipping_method||!fsv.shipping_method.code){
		return false;
	}
	var userCPF = $("#user_cpf").val();
	
	//普通物流不弹出CPF框
	if(fsv.shipping_method.type != "ExpressType" && fsv.shipping_method.type != "SpecialType"){
		return true;
	}
	//如果存在且格式正确，则直接返回,非必填时可为空，但是如果有值则格式必须正确
	if(fsv.order.quryBody.country != "BR" || cpfReg.test(userCPF)){
		return true;
	}
	TT_NS['dialog'].dialogBg(true, {css:{'z-index':999}});
    $('.cpf_numb').addClass('dialog_show');
	return false;
}

//点击对话框的关闭按钮
$(document).on('click','.cpf_numb .closeDialog',function () {
	var _this = $(this).parents('.bm_dialog');
	var userCPF = $("#user_cpf").val();
	if(!cpfReg.test(userCPF)){
		_this.find('.m_text_control').addClass('error');
		_this.find('.error_info').show();
		return;
	}
	$(".payment_method_con [name=pay_cpf]").each(function(){
		$(this).val(userCPF);
	});
    TT_NS['dialog'].closeDialog(_this);
});

$(document).on('click','.payment_method_con .pay_icon li',function () {
	$(this).addClass('active').siblings().removeClass('active');
	$(this).parents('li').find('[name="pay_bankCode"]').val($(this).attr("data-value"));
});

$(document).on('change','input[name="choiceFreeShipping"]',function(){
	updatePricePanel();
});

(function($){
    $.fn.carousel = function(opts){
        this.each(function(){
            init.call(this,opts);
        });
        return this;
    };
    function init(opts){
        var $menu         = $(this),
            _thisUl       = $menu.children('ul'),
            _thisLi       = _thisUl.children('li'),
            pages         = 0,//初始化的页码
            returnPages   = 0,//返回给页面的总页码
            _interval     = 0,
            now           = 1,//当前页码
            options       = $.extend({
                _full      : 'off',     //是否全屏
                _banner    : 'off',     //是banner还是list banner为on
                _point     : 'off',     //是否有小点
                _pointEvent: 'off',     //小点事件click hover
                _scroll    : 'off',     //是否有拉条
                _upDown    : 'off',     //是否上下
                _opacity   : 'off',     //渐隐效果
                _nav       : 'off',     //li宽度不统一的情况
                _auto      : 'off',     //是否自动播放
                _leftBtnShow: 'off',    //左边点击按钮初始化时是否显示
                _height    : '0.8',     //宽高比例 为空就不计算
                _height1200: 580,        //大于1200固定高度
                _autoTime  : '5000',    //自动播放时间
                _pointClass: 'nav_btn',
                _pointActive: 'active',
                _pointLabel: 'a',
                _leftClass : 'left-click',
                _rightClass: 'right-click',
                leftClick  : function(){},
                rightClick : function(){},
                callback   : function(a,b,$menu){}, //回调函数 返回page 当前页a 总页数 b
                textMove   : function(a){},//a为当前页码
            },opts);
            var _thisW,_thisLiW,_thisUlW,disX,starX,starXEnd,scrolEvent,direction,otherWidth;
            if($menu.find('.' + options._leftClass).length == 1){//如果子元素找不到左右点击按钮就找兄弟元素
                var leftBtn = $menu.find('.' + options._leftClass);
                var rightBtn = $menu.find('.' + options._rightClass);
            }else{
                var leftBtn = $menu.siblings('.' + options._leftClass);
                var rightBtn = $menu.siblings('.' + options._rightClass);
            }
            if(_thisLi.length > 1){
                if(options._banner == 'on' && options._opacity == 'off'){
                    var cloneFirst = _thisLi.first().clone();//克隆第一张图片
                    var cloneLast  = _thisLi.last().clone();//克隆最后一张图片
                    _thisUl.append(cloneFirst).prepend(cloneLast);//复制到列表最后
                }
                function initWH(){//初始化宽度
                    _thisW = options._upDown == 'on' ? $menu.outerHeight(true) : $menu.outerWidth(true);
                    _thisLiW = options._upDown == 'on' ? _thisLi.outerHeight(true) : _thisLi.outerWidth(true);
                    if(options._full == 'on'){
                        _thisLiW = document.body.clientWidth;
                        $menu.css({width:_thisLiW});
                        _thisUl.children('li').css({width:_thisLiW});
                    }
                    if(options._nav == 'on'){
                        _thisUlW = 4;
                        for(var i = 0; i < _thisLi.length; i++){
                            _thisUlW += _thisLi.eq(i).outerWidth(true);
                        }
                    }else{
                        _thisUlW = options._opacity == 'on' ? '' : _thisLiW*_thisUl.children('li').length;
                    }
                    var bannerH = $menu.outerWidth(true) > 1200 ? options._height1200 : $menu.outerWidth(true)*options._height; 
                    options._height == '' ? '' : ($menu.css({height: bannerH}));
                    options._upDown == 'on' ? _thisUl.css({height:_thisUlW}) : _thisUl.css({width:_thisUlW});
                }
                initWH();
                $(window).resize(function(){
                    initWH();//窗口改变的时候重新赋值。
                })
                //
                pages = options._opacity == 'on' ? _thisLi.length :  Math.ceil(_thisUlW/_thisW);
                if(options._banner == 'on' && options._opacity == 'off'){//如果是banner需要把clone的减掉
                    _thisUl.css({left:-_thisLi.eq(0).outerWidth(true)})
                    returnPages = pages - 2;
                }else{
                    returnPages = pages;
                }
                //插入小点
                if(options._point == 'on'){
                    var point = '';
                    for(var i = 0 , _len = returnPages; i < _len ; i++){
                        if(i == 0){
                            point += '<'+options._pointLabel+' class="'+ options._pointActive +'"></'+options._pointLabel+'>'
                        }else{
                            point += '<'+options._pointLabel+'></'+options._pointLabel+'>'
                        }
                    }
                    $menu.append('<div class="'+ options._pointClass +'">'+point+'</div>');
                }
                var pointBox = $menu.find('.'+ options._pointClass).children(options._pointLabel);
                //插入拉条
                if(options._scroll == 'on'){
                    if($menu.children('.feed-scrollbar').length == 0){
                        $menu.append('<div class="feed-scrollbar"><span class="feed-scrollbar-track"><span class="feed-scrollbar-thumb"></span></span></div>');
                    }
                    var _scrollBox   = $menu.children('.feed-scrollbar'),
                        _scroll      = _scrollBox.children().children(),
                        _scrollW     = _thisW / (_thisUlW / _thisW);
                        _scroll.css('width' , _scrollW);
                };
                //判断是pc端还是移动端
                function IsPC() 
                { 
                    var userAgentInfo = navigator.userAgent; 
                    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"); 
                    var flag = true; 
                    for (var v = 0; v < Agents.length; v++) { 
                        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; } 
                    } 
                    return flag; 
                };
                /***************
                *****拖拽*******
                ***************/
                var touchEvents = {
                    touchstart: "touchstart",
                    touchmove: "touchmove",
                    touchend: "touchend",
                    /**
                     * @desc:判断是否pc设备，若是pc，需要更改touch事件为鼠标事件，否则默认触摸事件
                     */
                    initTouchEvents: function () {
                        if (IsPC()) {
                            this.touchstart = "mousedown";
                            this.touchmove = "mousemove";
                            this.touchend = "mouseup";
                        }
                    }
                };
                var touchNow = function(){//计算页码
                    if(_thisUl.position().left == 0 && options._leftBtnShow == 'off'){
                        leftBtn.hide();
                    }else{
                        leftBtn.show();
                    }
                    var moveLeft = options._upDown == 'on' ? _thisUl.position().top : _thisUl.position().left;
                    now = Math.ceil(Math.abs(moveLeft/_thisW))+1;
                    pointBox.removeClass(options._pointActive).eq(now-1).addClass(options._pointActive);
                }
                var scrolEvents = function(scrolEvent){//判断拖拽左右两边的范围
                    if(scrolEvent > 0){
                        scrolEvent = 0;
                    }
                    if(_thisUlW + scrolEvent <= _thisW){
                        scrolEvent = -(_thisUlW - _thisW);
                    }
                    if(options._banner != 'on' && options._opacity == 'off'){
                        touchNow();
                        options.callback(now,returnPages,$menu);
                    }
                    return scrolEvent;
                }
                var bannerEvent = function(nows){//动画
                    if(options._opacity == 'on'){//渐隐
                        if(now > pages){ now = 1 }
                        if(now < 1){ now = pages }
                        var opacityNow = $menu.find('.'+ options._pointClass).children('.' + options._pointActive).index();
                        if(nows){
                            var next = nows-1;
                        }else{
                            var next =  direction == "+=" ? (opacityNow-1 < 0 ? pages-1 : opacityNow-1) : (opacityNow + 1 >= pages ? 0 : opacityNow+1);
                        }
                        var currObj = _thisLi.eq(opacityNow);
                        var nextObj = _thisLi.eq(next);
                        currObj.stop(true).fadeOut(1000);
                        nextObj.stop(true).fadeIn(1000,function(){
                            options.textMove(next);
                        });
                        options.callback(now,returnPages,$menu);
                        pointBox.removeClass(options._pointActive).eq(now-1).addClass(options._pointActive);
                    }else{//运动
                        var data = {};
                        var scrolldata = {};
                        if(starXEnd < 0){//向左边拖拽
                            now++
                            if(now >= pages-1){
                                now = pages-1;
                            }
                        }else if(starXEnd > 0){
                            now--
                            if(now <= 0){
                                now = 0;
                            }
                        }
                        if(options._banner == 'on'){//banner
                            scrolEvent = -_thisW * now;
                            data['left'] = scrolEvent;
                        }else{
                            scrolEvent = 0;
                            var ulLeft = options._upDown == 'on' ? _thisUl.position().top : _thisUl.position().left;
                            if(direction == '-='){
                                var otherMall = ulLeft%_thisLiW;//拖拽之后多出的距离
                                otherWidth = _thisUlW + ulLeft - _thisW;
                            }else{
                                if(-ulLeft%_thisLiW == 0){
                                    var otherMall = -ulLeft%_thisLiW;
                                }else{
                                    var otherMall = -ulLeft%_thisLiW-_thisLiW;
                                }
                                otherWidth = -ulLeft;
                            }
                            if(otherWidth == 0){//如果剩余快点等于0 则运动到开始或结束位置
                                otherWidth = -_thisUlW + _thisW;
                            }
                            if(otherWidth > _thisW){
                                scrolEvent = options._nav == 'on' ? _thisW : _thisW + otherMall;
                            }else{
                                scrolEvent = otherWidth;
                            }
                            var TL = options._upDown == 'on' ? 'top' : 'left';//判断哪个方向运动
                            data[TL] = direction + scrolEvent;
                            scrolldata['left'] = direction + (-scrolEvent*(_thisW/_thisUlW));
                        }
                        options._scroll == 'on' ? _scroll.animate(scrolldata) : '';
                        // console.log(-ulLeft%_thisLiW,_thisLiW)
                        _thisUl.animate(data,function(){
                            if(options._banner == 'on'){
                                if(now == 0){
                                    _thisUl.css({left:-_thisUlW + _thisW*2});
                                    now =  pages-2;
                                }
                                if(now == pages-1){
                                    _thisUl.css({left:-_thisW});
                                    now = 1;
                                }
                            }else{
                                touchNow();
                            }
                            options.textMove(now);
                            options.callback(now,returnPages,$menu);
                            pointBox.removeClass(options._pointActive).eq(now-1).addClass(options._pointActive);
                        })
                    }
                }
                touchEvents.initTouchEvents();//初始化拖拽是pc还是m
                var disEvent = 0;
                var mousemove = function(e){
                    scrolEvent = options._upDown == 'on' ? e.clientY - disEvent : e.clientX - disEvent;
                    scrolEvent = scrolEvents(scrolEvent);
                    if(_thisUlW > _thisW){
                        options._upDown == 'on' ? _thisUl.css({top:scrolEvent}) : _thisUl.css({left:scrolEvent});
                        options._scroll == 'on' ? _scroll.css({left:-scrolEvent*(_thisW/_thisUlW)}) : '';
                    }
					starXEnd = e.clientX-starX;
					if(options._auto == 'off'){
						$menu.click(function(e){//滑动的时候禁止链接跳转
							e.preventDefault();
						})
					}
                };
                var mouseup = function(e)
                {
                    if(options._opacity == 'off'){
                        this.onmousemove = null;
                        this.onmouseup = null;
                        if(_thisUl.releaseCapture)
                        {
                            _thisUl.releaseCapture();
                        };
                        if(options._banner == 'on' && !_thisUl.is(":animated")){
                            bannerEvent();
                        }else{
                            touchNow();
                            $menu.find("img.lazy").lazyload({threshold : 50 });
                        }
                        if(starXEnd == 0){//点击的时候让链接跳转
                            $menu.unbind('click');
                        }
                    }
                };
                _thisUl.bind(touchEvents.touchstart, function (e) {
                    starXEnd = 0;
                    if (!IsPC()){
                        var touch = e.originalEvent.changedTouches[0];
                        disX = touch.clientX - this.offsetLeft;
                        disY = touch.clientY - this.offsetTop;
                        //手指按下时的坐标
                        starX = touch.clientX;
                    }else{
                        e.preventDefault();
                        disEvent = options._upDown == 'on' ? e.clientY - _thisUl.position().top : e.clientX - _thisUl.position().left;
                        starX = e.clientX;
                        if(_thisUl.setCapture) //IE
                        {
                            _thisUl.onmousemove = mousemove;
                            _thisUl.onmouseup = mouseup;
                            _thisUl.setCapture();
                        }else
                        {
                            document.onmousemove = mousemove;
                            document.onmouseup = mouseup
                        };
                    }
                });
                if (!IsPC()){
                    _thisUl.bind(touchEvents.touchmove, function (e) {
                        e.preventDefault();
                        var touch = e.originalEvent.targetTouches[0]; 
                        scrolEvent = options._upDown == 'on' ? touch.pageY - disY : touch.pageX - disX;
                        starXEnd = touch.pageX - starX;
                        scrolEvent = scrolEvents(scrolEvent);
                        if(_thisUlW > _thisW){
                            options._upDown == 'on' ? _thisUl.css({top:scrolEvent}) : _thisUl.css({left:scrolEvent});
                            options._scroll == 'on' ? _scroll.css({left:-scrolEvent*(_thisW/_thisUlW)}) : '';
                        }
                    });
                    _thisUl.bind(touchEvents.touchend, function (e) {
                        if(options._banner == 'on' && options._opacity == 'off' && !_thisUl.is(":animated")){
                            bannerEvent();
                        }else{
                            touchNow();
                        }
                    });
                }
                //自动播放
                if(options._auto == 'on'){
                    var _automove = function(){
                        starXEnd = 0;
                        clearInterval(_interval);
                        _interval = setInterval(function(){
                            now++;
                            direction = "-=";
                            bannerEvent();
                        },options._autoTime)
                    }
                    _automove();
                }
                leftBtn.click(function(){
                    options.leftClick();
                    if(!_thisUl.is(":animated") && !_thisLi.is(":animated")){
                        now--
                        starXEnd = 0;
                        direction = "+=";
                        bannerEvent();
                    }
                })
                rightBtn.click(function(){
                    options.rightClick();
                    if(!_thisUl.is(":animated") && !_thisLi.is(":animated")){
                        now++
                        starXEnd = 0;
                        direction = "-=";
                        bannerEvent();
                        $menu.find("img.lazy").lazyload({threshold : 1155 });
                    }
                })
                var point = function(_index){
                    if(!_thisUl.is(":animated") && !_thisLi.is(":animated")){
                        starXEnd = 0;
                        now = _index + 1;
                        bannerEvent(now);
                    }
                };
                if(options._pointEvent == 'off'){
                    $menu.find('.'+ options._pointClass).children(options._pointLabel).click(function(){
                        var _index = $(this).index();
                        point(_index)
                    })
                }else{
                    $menu.find('.'+ options._pointClass).children(options._pointLabel).mouseover(function(){
                        var _index = $(this).index();
                        point(_index)
                    })
                }
                // $menu.find('.'+ options._pointClass).children(options._pointLabel).click(function(){
                //     if(!_thisUl.is(":animated") && !_thisLi.is(":animated")){
                //         var _index = $(this).index();
                //         starXEnd = 0;
                //         now = _index + 1;
                //         bannerEvent(now);
                //     }
                // })
                $menu.mouseover(function(){
                    clearInterval(_interval);
                    if(options._banner == 'on'){
                        leftBtn.show();
                        rightBtn.show();
                    }
                })
                $menu.mouseout(function(){
                    options._auto == 'on' ? _automove() : '';
                    if(options._banner == 'on'){
                        leftBtn.hide();
                        rightBtn.hide();
                    }
                })
                if(_thisUlW < _thisW && _thisUlW != ''){
                    $menu.find('.feed-scrollbar').hide();
                    leftBtn.hide();
                    rightBtn.hide();
                }
                if(_thisUl.position().left == 0 && options._opacity == 'off' && options._leftBtnShow == 'off'){
                    leftBtn.hide();
                }
                options.callback(now,returnPages,$menu);
                options._opacity == 'on' ? options.textMove(now-1) : options.textMove(now);
            }
    }
})(jQuery);

/*+++++++++重构部分++++++++++*/
/**
*@模块： TOMTOP使用的命名空间为TT_NS
*@作者： caoxl
*@日期： 2016-06-29
*/
var TT_NS = TT_NS || {};
/*
*@名称:  TT_GET
*@作者： caoxl
*@日期： 2016-06-29
*@参数:  String name 模块名称
*@描述： 该函数是获取TT_NS命名空间下的模块
*        注意不要直接使用TT_NS.xxx 以免将来TT_NS发生改变
*@返回:  mixed
*/
var TT_GET = function(name){
	return (function($){
				window.TT_NS = window.TT_NS || {};
				name = $.trim(name);
				return window.TT_NS[name];
			})(jQuery);
}

/*
*@模块:  各种基础模块的初始化
*/
var TT_NS = (function(NS, $){
	/*
	* 配置模块
	*/
	NS['config'] = NS['config'] || {};
	NS['config']['domain'] = (function(){
									var _winUrl = window.location.href;
									var _arr =  [];
									_arr = _winUrl.split(".");
									return _arr[0]+".tomtop.com/";
							})();
	NS['config']['urlCDN'] = '//img.tttcdn.com';
	NS['config']['url2000'] = NS.config.urlCDN + '/product/xy/2000/2000/';
	NS['config']['url560'] = NS.config.urlCDN + '/product/xy/560/560/';
	NS['config']['url500'] = NS.config.urlCDN + '/product/xy/500/500/';
    NS['config']['url168'] = NS.config.urlCDN + '/product/xy/168/168/';
	NS['config']['webUrl'] = '//static.tomtop.com/tomtop/';
	/*
	* cookie模块
	*/
	NS['cookie'] = {
		/*
		*@名称:  get 获取cookie
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  String name cookie名称
		*@描述:  使用方法TT_GET('cookiePkg').get('name');
		*@返回:  如果cookie存在返回cookie 否则返回null
		*/
		'get': function(name){
			var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			return arr != null ? unescape(arr[2]) : null;
		},
		/*
		*@名称:  set 设置cookie
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  String name cookie名称
		*@描述:  使用方法TT_GET('cookiePkg').set('name', 'value');
		*@返回:  boolean
		*/
		'set':function(name, value){ 
		   var exp = new Date();  
		   exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000); //3天过期  
		   document.cookie = name + "=" + encodeURIComponent(value) + ";domain=.tomtop.com;expires=" + exp.toGMTString()+";path=/";  
		   return true;  
		},
		/*
		*@名称:  del 删除cookie
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  String name cookie名称
		*@描述:  使用方法TT_GET('cookiePkg').del('name');
		*@返回:  boolean
		*/
		'del':function(name){
			 var _this = this;
			 var _exp = new Date();  //当前时间
		     _exp.setTime(_exp.getTime() - 1);
		     var _cval = _this.get(name);
		     if(_cval != null){
		     	document.cookie= name + "="+_cval+";domain=.tomtop.com;expires="+_exp.toGMTString()+";path=/";
		     }
		},
		'tem' : function(name, value) {
           var _domain = NS['config']['cookieDomain'];
           document.cookie = name + "=" + encodeURIComponent(value) + ";domain=.tomtop.com;path=/";
           return true;
        },
		'defauleCurr' : function(){
			if(this.get('TT_CURR') == null){
				this.set('TT_CURR','USD')
			}
		}
	};
	/*
	* 加密解密TT_NS.base64.base64Encode(input)
	*/
	NS['base64'] = {
		//base64加密函数
		base64Encode: function(input)
		{
			var rv = encodeURIComponent(input);
			rv = unescape(rv);
			rv = window.btoa(rv);
			return rv;
		},
		//base64解密函数
		base64Decode:function(input)
		{
			var rv = window.atob(input);
			rv = escape(rv);
			rv = decodeURIComponent(rv);
			return rv;
		}
	};
	/*
	* 价格模块
	*/
	NS['price'] = {
		/*
		*@名称:  switch 切换价格
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  float usAmount 美元价格
		*		 float rate 汇率
		*@描述:  使用方法TT_GET('price').switch('价格', '汇率');
		*@返回:  float
		*/
		'switch':function(usAmount,rate){
			var _curr = NS.cookie.get("TT_CURR");
			if(_curr=="JPY"){
                var price = Math.round((usAmount * rate*10000+1)/10000);
			}else{
                var price = (Math.round((usAmount * rate*1000000+1)/10000)/100).toFixed(2);
			}
			return price;
		}
	};

	/*
	* 语言模块
	*/
	NS['lang'] = {
		/*
		*@名称:  getId 获取语言ID
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  string code 语言代码
		*@描述:  使用方法TT_GET('lang').getId('us');
		*@返回:  float
		*/
		'getId':function(code){
			var _conf = {'es':2, 'ru':3, 'de':4, 'fr':5, 'it':6, 'jp':7, 'pt':8, 'pl':9, 'ar':11};
			code = code.toLowerCase();
			return _conf[code] === undefined ? 1 : _conf[code];
		}
	};
	/*
	* ajax 语言参数
	*/
	NS['lactions'] = {
		/*
		*@名称:  getId 获取语言ID
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  string code 语言代码
		*@描述:  使用方法TT_NS.lactions.lang();
		*@返回:  float
		*/
		'lang':function(){
			var locations = window.location.href;
			var lang = /\/es\/|\/ru\/|\/de\/|\/fr\/|\/it\/|\/ar\/|\/pl\/|\/jp\/|\/pt\/|\/en\//;
				lang = lang.test(locations);
			if(lang == true){
				lang = locations.split("/");
				return '&lang='+lang[3];
			}else{
				return '';
			}
		},
		/*
		*@名称:  getId 获取语言ID
		*@作者： caoxl
		*@日期： 2016-06-29
		*@参数:  string code 语言代码
		*@描述:  使用方法TT_NS.lactions.langShort();
		*@返回:  float
		*/
		'langShort':function(){
			var locations = window.location.href;
			var lang = /\/es\/|\/ru\/|\/de\/|\/fr\/|\/it\/|\/ar\/|\/pl\/|\/jp\/|\/pt\/|\/en\//;
				lang = lang.test(locations);
				if(lang == true){
					lang = locations.split("/");
					return lang[3];
				}else{
					return '';
				}
		}
	};
	NS['TT_AD_TOP'] ={
    		
		/**
	     * @functionName: TT_AD_TOP
	     * @author:       wxl
	     * @date:         20161104
	     * @param:        无
	     * @description:  底部广告条，当用户点击关闭按钮的时候,记录cookie值，关掉之后不再显示，cookie的有效时间为一天。
	     * @return:       无
	     */
	    'adCookie':'',
	    'init':function(){
	          var _this = this;
	          _this.showTopAD("#close_topad");
	          _this.closeTopAd();
	    },
	   'setCookie':function(name, value ,day){  
		    var _day = day || 7;
	        var oDate = new Date();
	        oDate.setDate(oDate.getDate() + _day);
	        document.cookie = name + '=' + value + '; expires =' + oDate;
		},
	    'closeTopAd':function(){
	    	var _this = this;
	    	$("#close_topad").click(function(){
	    		_this.adCookie = $(this).parent().find("img").attr('alt');
	            _this.setCookie('topAD',_this.adCookie,1);
	            $(this).parent().hide();
	        })
	    },
	    'showTopAD':function(obj){
	    	var _this = this;
	    	_this.adCookie = $(obj).parent().find("img").attr('alt');
	    	var ckTopAd = NS['cookie'].get('topAD');
	    	if(ckTopAd == _this.adCookie){
	            $(obj).parent().hide();
	        }else{
	        	$(obj).parent().show();
	        }
	    }
	};
	NS['video'] = {
		init : function(){
			$('.show_video_btn').click(function(){
				var url = $(this).attr('data-rel');
				$('#dialog_video').find('iframe').attr('src',url);
			})
			$('#dialog_video .close_dialog').click(function(){
				$('#dialog_video').find('iframe').attr('src','');
			});
			$(document).on('click','#dialog_video',function(){
				$('#dialog_video').find('iframe').attr('src','');
			})
		}
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
            $submenu.css({display: "block" });
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
				},500)
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
				_this.find('img.navlazy').lazyload();
			},function(){
			    var _this = $(this);
			    $(this).parents('.nav_l').css('z-index',80);
			  	// _this.find(".slide_menu").hide();
				_this.removeClass('cur');
			});
			$(".menu_wrap dl").hover(function(){
                $(this).addClass('cur').siblings().removeClass('cur');
            });
            //显示遮罩层
            categoryContainer.hover(function(){
            	$(this).parents('.nav_l').css('z-index',200);
            	clearTimeout(oTime['1']);
            	if($('.mask2').length == 0){
            		var el = '<div class="mask2"></div>';
            		if($(".mask2").length == 0){
            			$("body").append(el);
            		}
            		$(".m_top_nav .dropdown_link,.m_top_nav .dropdown_menu").css('z-index',50);
            	}
            },function(){
            	$('.mask2').remove();
            	$(this).parents('.nav_l').css('z-index',80);
            	$(".m_top_nav .dropdown_link").css('z-index',400);
            	$(".m_top_nav .dropdown_menu").css('z-index',300);
            	if($(this).parents('.m_nav_category').find('.fixed_category').size()>0){
            		$(this).hide();
            	}
            })
		},
        /*导航分组 by wxl*/
	    'fnGrouping' : function(i){
			//类目分组
		    var iMaximum = 20;
		    var objs = $('.slide_menu').not('.m_nav_tomtop .slide_menu');
		    for (var i = 0; i < objs.length; i++) {
		    	//根据不同类目设置每列放置的高度。
		    	if(i == 2){
                   iMaximum = 25;
                  //console.log(iMaximum);
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
	//检查email
	NS['check'] = {
		'email': function(email){
				var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
				var isok = reg.test(email);
				if (!isok) {
					return false;
				}else{
					return true;
				}
		}
	};
	NS['country'] = {
		'search' : function(q){
			var regstr = $(q).val() + ".*";
			var reg = new RegExp(regstr, "i");
			$(q).parent().next(".all_country").children('li').each(function(i) {
				$(this).hide();
			});
			$(q).parent().next(".all_country").children('li').each(function(i) {
				if ($.trim($(this).html()) != "") {
					if (reg.test($(this).children("em").html().toLowerCase())) {
						$(this).show();
					} else {
						$(this).hide();
					}
				}
			});
		},
		'init' : function(){
			var _this = this;
			$(document).on('click','.all_country li',function(){
			//$('.all_country li').on('click',function(){
				var countryText = $(this).children("em").text();
				var countryCode = $(this).children("em").attr("data");
				if($(this).parents('.select_state').length != 0){
					var selectState = $(".m_pullDown_country").children('.result')
					selectState.removeClass().addClass("result " + countryCode);
					selectState.children('em').text(countryText);
					$('#current_country_flage').removeClass().addClass(countryCode);
					$('#current_country_flage').siblings('.flag_Txt').text(countryText);
				}else{
					var counters = $(this).parents('.country_part');
					counters.find('.result').removeClass().addClass("result " + countryCode);
					counters.find('.result').children('em').text(countryText);
				}
				$('.tt_country').val(countryCode);
				$(".m_more_country").hide();
				$(".m_pullDown_country").removeClass('openD')
				// $('.country_part').find('input[name=countryState]').val(countryCode);
			});
			//搜索
			$("input[name=country_filter]").keyup(function(e) {
				_this.search(this);
				e.stopPropagation();
			});
			//国家显示隐藏
			$('.m_pullDown_country .result').on('click',function(e){
				$(this).siblings('.m_more_country').toggle();
				$(".m_pullDown_country").toggleClass('openD');
				$('.bm_option .option_list').hide();
				e.stopPropagation();
			});
			//点击弹出货币选择
			$('.currency_part .bm_option .result').on('click',function(e){
				$(this).siblings('.option_list').toggle();
				$('.m_pullDown_country .m_more_country').hide();
				e.stopPropagation();
			});
			//货币选择之后赋值
			$(".option_list a").on("click",function(e){
				var currency = $(this).attr("data-currency");
				var txts = $(this).children("span").text();
				var results = $(this).parentsUntil(".currency_pop .pu_notranslate").prev(".active");
				$('.currency_part .bm_option .result').children("span").html(txts);
				$('.tt_currency').val(currency);
				$('.currency_part .bm_option .result').children("em").html(currency);
				$(this).parents(".option_list").hide();
				e.stopPropagation();
			});
			//点击保存按钮赋值
			$(".dropdown_menu .btn_save .btn").on('click',function(){
				var country = $(this).parent().siblings('.country_part').children('.m_pullDown_country');
				var countryVal = country.find('.result').children('em').text();
				var currency = $('.currency_part .bm_option .result');
				var currencyImg = currency.find('span').text();
				var currencyVal = currency.find('em').text();
				var current = $(".m_shipto_wrap");
				var countryCode = $('.tt_country').val();
				var currencyCode = $('.tt_currency').val();
				switchCurrency(currencyVal);
				current.find('.flag_Txt').text(countryVal);
				current.find('.flag_currency').text(currencyVal);
				$('.bm_dropdown').removeClass('openD');
				if(countryCode != ''){
					NS['cookie'].set("TT_COUN",countryCode)
					//改变邮费弹框国家
					var counRes = $('.m_pullDown_country').children('.result');
					counRes.removeClass().addClass('result '+ countryCode);
					counRes.children('em').text(countryVal);
					current.find("#current_country_flage").removeClass().addClass(countryCode);
					//刷新邮费
					if($('.navFixedTop').length == 1){
						$(".symbolLab").text(currencyImg);
						if (countryCode != TT_GET('shipping').country) { //如果选择的国家发生的变化则重新获取数据
							TT_GET('shipping').changeCountry(countryCode);
							TT_GET('shipping').getShippingData({});
						}
					}
				}
				if(currencyCode != ''){
					NS['cookie'].set("TT_CURR",currencyCode)
				}
			});
		}
	};
	NS['arr'] = {
		isInArray: function(arr,value){
			for(var i = 0; i < arr.length; i++){
				if(value === arr[i]){
					return true;
				}
			}
			return false;
		}
	};
	NS['hist'] = {//底部历史记录
		'init': function (){
			$('.shopping_history_show').click(function(){
				$(this).children().hasClass("icon_top") ? $(this).children().removeClass('icon_top').addClass('icon_bottom') : $(this).children().addClass('icon_top');
				$(".shopping_history_content").toggle();
				$.ajax({
					type: "GET",
					cache : false,
					url: NS['config']['domain']+"index.php?r=site/rview"+TT_NS.lactions.lang(),
					dataType:'html',
					success: function (html) 
					{
						$(".fixedRecently").html(html);
						$(".fixedRecently img.lazy").lazyload();
					}
				});
			})
		}
	};
	NS['dayDeals'] = {//折扣轮播
		'init' : function(){
			if($('.dailyDeals').length == 1){
				var urls = ajaxLang("index.php?r=site/daily");
				$.ajax({
					type: "GET",
					cache : false,
					url: urls+TT_NS.lactions.lang(),
					dataType:'html',
					success: function (html) 
					{
						$(".dailyDeals").html(html)
						$(".dailyDeals img.lazy").lazyload();
						NS['scrolTop'].btnEvent('.dailyDeals','on');
						try{
							var dates = $("#serverTime").text().split(" ")[0];
							if(dates.indexOf("-")>0){
								dates= dates.replace(/\-/ig,"\/");
							}
							$('.dealsWarp').find('.countdown').downCount({
								date: dates+' 23:59:59'
							});
						}catch(e){}
					}
				});
			}
		}
	};
	NS['scrolTop'] = {
        'event': function(box,fun){
			var recently = false;
			if(box.length != 0){
				$(window).scroll(function(){
					var scrRecently = box.offset().top;
					if(scrRecently >= $(window).scrollTop() && scrRecently <($(window).scrollTop()+$(window).height()) && recently == false)
					{
						if(box.children().length == 0) {
							fun()
						}
						recently = true;
					}
				});
				if(box.offset().top-scTop()<$(window).height() && recently == false){
						fun()
						if(box.children().length == 0) {
							recently = true;
						}
				}
			}
		},
		'btnEvent': function(box,auto = 'off'){
			$(box + ' .moveHidden').carousel({
				_height    : '',
				_auto      : auto,
				_leftClass : 'leftArr',
				_rightClass: 'rightArr',
				callback   : function(a,b){//返回的页码
					$(box).find('.page').text(a);
					$(box).find('.pages').text(b);
				},
			});
		},
	};
	NS['viewedFeatured'] = {
		/**
		 * @desc 历史记录 返回相关产品
		 * @desc 公用
		 */
        'historyPage': 0,
        'historyAllPage': 0,
		'event': function(){
			var _this = this;
			NS['scrolTop'].event($("#viewedFeatured"),function(){
				$("#viewedFeatured").append("<div class='loading-ajax' />");
				var urls = ajaxLang("index.php?r=site/ajaxvf");
				$.ajax({
					type: "GET",
					cache : false,
					url: urls+TT_NS.lactions.lang(),
					dataType:'html',
					success: function (html)
					{
						$("#viewedFeatured").html(html);
						$("#viewedFeatured img.lazy").lazyload();
						$(".loading-ajax").remove();
						$('.viewedWarp .moveHidden').carousel({
							_height    : '',
							_leftClass : 'leftArr',
							_rightClass: 'rightArr',
							callback   : function(a,b){//返回的页码
								_this.historyPage = a;
								_this.historyAllPage = b;
							}
						});
						$('.alsoLike .moveHidden').carousel({
							_height    : '',
							_leftClass : 'leftArr',
							_rightClass: 'rightArr',
						});
						_this.init();

					}
				});
			})
		},
		'init': function(){
			var _this = this;
			var lC = $(".viewedWarp").children(".leftArr");
			var rC = $(".viewedWarp").children(".rightArr");
			var list = $(".viewedWarp").find(".moveList");
			
			for(var i=0;i<list.length-1;i++){
				$(".histRightBox").append('<div class="listMoveWarp alsoLike"></div>')
			}
			rC.click(function(){
                var listing = _this.historyPage == _this.historyAllPage ? 0 : _this.historyPage;
				var listingID = list.eq(listing).attr("rel-data");
				if($(".alsoLike").eq(listing).children().length==0){
					$(".histRightBox").append("<div class='loading-ajax' />")
					$.ajax({
						type: "GET",
						url: NS['config']['domain']+"index.php?r=site/ajaxyoumightlike&position=foot"+TT_NS.lactions.lang(),
						timeout : 10000,
						data: "listing_id="+listingID,
						dataType:'html',
						success: function(html){
							$(".alsoLike").eq(listing).html(html);
							$(".alsoLike").eq(listing).find('.lazy').lazyload();
							$(".alsoLike").eq(listing).siblings(".alsoLike").hide();
							$(".alsoLike").eq(listing).show();
							$('.alsoLike .moveHidden').carousel({
								_height    : '',
								_leftClass : 'leftArr',
								_rightClass: 'rightArr',
							});
							$(".loading-ajax").remove();
						}
					});
				}else{
						$(".alsoLike").eq(listing).siblings(".alsoLike").hide();
						$(".alsoLike").eq(listing).show();
				}
			})
			lC.click(function(){
                var listing = _this.historyPage == 1 ? _this.historyAllPage-1 : _this.historyPage-2;
					$(".alsoLike").eq(listing).siblings(".alsoLike").hide();
					$(".alsoLike").eq(listing).show();
			})
		}
	}
	NS['viewedFeatured'].event();
	NS['dayDeals'].init();
	NS['country'].init();
    NS['NAV'].init();
    NS['TT_AD_TOP'].init();
    NS['video'].init();
	NS['cookie'].defauleCurr();
	NS['hist'].init();
	return NS;
})(window.TT_NS || {}, jQuery);
/*+++++++++重构部分++++++++++*/
url2000 = TT_NS['config']['urlCDN'] +"/product/xy/2000/2000/";
url560 =  TT_NS['config']['urlCDN'] +"/product/xy/560/560/";
url500 =  TT_NS['config']['urlCDN'] +"/product/xy/500/500/";
url168 =  TT_NS['config']['urlCDN'] +"/product/xy/168/168/";
url60 =  TT_NS['config']['urlCDN'] +"/product/xy/60/60/";
//webUrl = "http://static.tomtop.com/tomtop/";
webUrl = TT_CONFIG.staticUrl;
var winUrl = window.location.href;
var winArr =  new Array();
winArr = winUrl.split(".");
domain = winArr[0]+".tomtop.com/";
//domain = "http://192.168.220.55/";
//domain = "http://localhost/";
/*
 功能：给登陆后的 url 加参数
 */
$(function(){
	if($("#logout").length==1){
		var aid = $("#logout").attr("aid");
		if(aid != "" && winUrl.indexOf("?aid")== -1 && winUrl.indexOf("&aid")== -1){
			if(winUrl.indexOf("?")== -1){
				window.history.replaceState(null, null, winUrl+"?aid="+aid);
			}else{
				window.history.replaceState(null, null, winUrl+"&aid="+aid);
			}
		}
	}
});
//特殊情况  冒泡之后有些点击事件需要一起消失：
var EventHide = {
	popCurrAndCountry:function(){
		$('.m_shipto_wrap .country_pop,.m_shipto_wrap .currency_pop').hide();
		$('.pu_blockWarp_click').hide();
    	$('.pu_navHover_click').removeClass('active');
	},
	popCategory:function(){
		 $('.bm_option .option_list').hide();
	}
}
/*
获取url中的参数
 */
function request(paras) {  
   var url = location.href;  
   var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");  
   var paraObj = {}  
   for (i = 0; j = paraString[i]; i++) {  
       paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);  
   }  
   var returnValue = paraObj[paras.toLowerCase()];  
   if (typeof (returnValue) == "undefined") {  
       return "";  
       } else {  
           return returnValue;  
       }  
   } 
/*
 功能：方法
 参数：循环数组 删除重复数值
 */
function unique(arr){// 遍历arr，把元素分别放入tmp数组(不存在才放)
	var tmp = new Array();
	for(var i in arr){//该元素在tmp内部不存在才允许追加
		if(tmp.indexOf(arr[i])==-1){
			tmp.push(arr[i]);
		}
	}
	return tmp;
}

/*
 功能：保存cookies函数 
 参数：name，cookie名字；value，值
 */
function SetCookie(name, value) {  
   var exp = new Date();  
   exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000); //3天过期  
   document.cookie = name + "=" + encodeURIComponent(value) + ";domain=.tomtop.com;expires=" + exp.toGMTString()+";path=/";  
   return true;  
};
/*
 功能：设置临时cookie
 参数：name，cookie名字；value，值
 */
function temCookie(name, value) {  
   document.cookie = name + "=" + encodeURIComponent("["+value+"]") + ";domain=.tomtop.com;path=/";  
   return true;  
};
 /*
 功能：获取cookies函数 
 参数：name，cookie名字
 */
 function getCookie(name){
     var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
     if(arr != null){
    	 return unescape(arr[2]); 
     }else{
    	 return null;
     }
 } 
 /*
 功能：删除cookies函数 
 参数：name，cookie名字
 */

 function delCookie(name){
     var exp = new Date();  //当前时间
     exp.setTime(exp.getTime() - 1);
     var cval=getCookie(name);
     if(cval!=null) document.cookie= name + "="+cval+";domain=.tomtop.com;expires="+exp.toGMTString();
 }
 /**
 *功能：计算价格
 *参数：
 * usAmount:价格
 * rate    :汇率
 */
function switchPrice(usAmount,rate){
	var curr = TT_NS.cookie.get("TT_CURR");
	if(curr=="JPY"){
		var price = Math.round((usAmount * rate*10000+1)/10000);
	}else{
        var price = (Math.round((usAmount * rate*1000000+1)/10000)/100).toFixed(2);
	}
	return price;
}
 /**
 * @desc 方法
 */
//解析cookie值
 function trim(str){     //删除左右两端的空格           
    return str.replace(/(^\s*)|(\s*$)/g, "");  
}    
function parseJSON(data){  
    if ( typeof data !== "string" || !data ) {  
        return null;  
    }  
    data = jQuery.trim(data);
    if ( window.JSON && window.JSON.parse ) {  
        return window.JSON.parse(data);  
    }  
    if ( rvalidchars.test( data.replace( rvalidescape, "@" )  
        .replace( rvalidtokens, "]" )  
        .replace( rvalidbraces, "")) ) {  
        return ( new Function( "return " + data ) )();  
    }  
    OpPopAlert( "Invalid JSON: " + data );  
    return;  
}  

 /**
 * @desc 方法
 */
//拆分cookie值
function writeCookie(name){//获取指定名称的cookie的值
    var arrLang = document.cookie.split("; ");
    for(var i = 0;i < arrLang.length;i ++){
        var temps = arrLang[i].split("=");
        if(temps[0] == name){
        	return unescape(temps[1]);
        }
   }
}

 /*
 功能：scrollTop
 */
function scTop(){
	var scTop;
	if(document.body.scrollTop){ //非标准写法,chrome能识别
		scTop=document.body.scrollTop;
	}
	else{ //标准写法
		scTop=document.documentElement.scrollTop;
	}
	return scTop;
}
$scTop = scTop();

/*
 *ajax 语言
 * */
function ajaxLang(rUrl){
	if(request('lang') == '' && request('currency') == ''){
		var urls = TT_NS['config']['domain']+rUrl
	}else{
		var lang = request('lang');
		var currency = request('currency');
		var urls = TT_NS['config']['domain']+rUrl+"&lang="+lang+"&currency="+currency;
	}
	return urls;
}

/////======================只能输入数字================================
function IsNum(e) {
    var k = window.event ? e.keyCode : e.which;
    if (((k >= 48) && (k <= 57)) || k == 8 || k == 0) {
    } else {
        if (window.event) {
            window.event.returnValue = false;
        }
        else {
            e.preventDefault(); //for firefox 
        }
    }
} 

/*
 功能：将字符串转换为代码执行 替代eval方法
 */
var playLang = ['en','es','ru','de','fr','it','jp','pt','pl','ar'];
var jsLanguage='en';
$.each(playLang,function(key,val){
	if(val == TT_NS.lactions.langShort()){
		jsLanguage = TT_NS.lactions.langShort();
	}
})

function strFun(fn) {
    var Fn = Function;  //一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)();
}

/**
 * @desc 通用JS
 */
//切换货币
function switchCurrency(currency){
	var usAmount = 0;
	var rate = currencyRate[currency];
	var label = currencyLabel[currency];
	
	//保存cookie保存cookie
	delCookie("TT_CURR");
	SetCookie("TT_CURR",currency);
	$('.pricelab').each(function(){
		usAmount = $(this).attr('usvalue');
		if(usAmount == ''){return}
		var curr = TT_NS.cookie.get("TT_CURR");
		if($(this).hasClass("price")){
		    var price = switchPrice(usAmount,rate);
		    $(this).html(price);
		}else{
            var price = switchPrice(usAmount,rate);
            $(this).html(label + price);
		}
	});
	$(".symbolLab").html(label);
	//计算捆绑总价
	if($("#fBox_Box").length > 0) {
		TT_NS.featured.prices();
	}
	if($("#RecommendedItems").length > 0){
		TT_NS.featured.fixedPrice();
	}
}
$(function(){
	 $(".pu_navHover").parent(".lineBlock,.rightHover").hover(function() {
		 if($(this).find('.pu_blockWarp').hasClass('signJoin')){
			 SetCookie("TT_REDIRECT_URL",window.location.href);
		 }
		 $(this).find(".pu_blockWarp").show()
    }, function() {
        $(this).find(".pu_blockWarp").hide()
    });
	if(TT_NS.cookie.get("TT_CURR")){
		var cookies = TT_NS.cookie.get("TT_CURR");
		switchCurrency(cookies);
		var tt_cur_txts = currencyLabel[cookies];
		var currbox = $('.currency_part').children('.active');
		$(".flag_currency").text(cookies);
		currbox.children('span').text(tt_cur_txts);
		currbox.children('em').text(cookies);
    }
    $('.codeInput').next('img').click();
})


//切换语言，国家
function switchSiteInfo(country, currency, language){
	var url = window.location.href;
	$.ajax({
		type : 'post',
		url : domain+'index.php?r=site/switchinfo'+TT_NS.lactions.lang(),
		data : {country:country, currency:currency, language:language},
		success : function(data){
			window.location.reload();
		},
		dataType : 'json'
	});
}

/* 改变url参数
* url 目标url 
* arg 需要替换的参数名称 
* arg_val 替换后的参数的值 
* return url 参数替换后的url 
*/ 
function changeURLArg(url,arg,arg_val){ 
    var pattern=arg+'=([^&]*)'; 
    var replaceText=arg+'='+arg_val; 
    if(url.match(pattern)){ 
        var tmp='/('+ arg+'=)([^&]*)/gi'; 
        tmp=url.replace(eval(tmp),replaceText); 
        return tmp;
    }else{ 
        if(url.match('[\?]')){ 
            return url+'&'+replaceText; 
        }else{ 
            return url+'?'+replaceText; 
        } 
    } 
    return url+'\n'+arg+'\n'+arg_val; 
} 
/**
 * @desc 通用JS
 */
//切换语言
function getLanguageId(code){
	switch (code){
		case 'es':
		  landId=2;
		  break;
		case 'ru':
		  landId=3;
		  break;
		case 'de':
		  landId=4;
		  break;
		case 'fr':
		  landId=5;
		  break;
		case 'it':
		  landId=6;
		  break;
		case 'jp':
		  landId=7;
		  break;
		case 'pt':
		  landId=8;
		  break;
        case 'pl':
          landId=9;
          break;
        case 'ar':
          landId=11;
          break;
		default:
		  landId=1;
	}
	return landId;
}

$(function(){
	//读取cookie的值 
	function switchLanguage(language){
		delCookie("PLAY_LANG");
		SetCookie("PLAY_LANG",language);
		delCookie("TT_LANG");
		SetCookie("TT_LANG",getLanguageId(language));
	}
	if(TT_NS.cookie.get('PLAY_LANG')){
		switchLanguage(TT_NS.cookie.get('PLAY_LANG'));
	}
	var langC = $(".pu_langWarp").siblings(".pu_blockWarp").children("a");
	langC.bind("click",function(){
		$(this).parents(".pu_blockWarp").hide();
	})
})

/**
 * @desc 通用JS
 */

/**
 * @desc 通用JS
 */
//返回顶部
$(window).scroll(function() {
	if ($(window).scrollTop() > 300) {
		$(".toTopButton").slideDown(200);
	} else {
		$(".toTopButton").slideUp(200);
	}
});

$(function(){
	$(".toTopButton").click(function() {
		$("html,body").animate({
			scrollTop : 0
		});
	});
})

/**
 * @desc 通用JS
 */
//搜索 传值
$(function(){
    ////////but 跳转
    var searchC = $(".search_wrap").children(".search_btn");
    function searchShort(){
        var shorts = TT_NS.lactions.langShort();
        if(shorts == ''){
            shorts = '';
        }else{
            shorts = shorts+'/';
        }
        return shorts;
    }
    function cpathVal(){
        return $('.search_wrap .bm_option .result em').data('path');
    }
    function searchVal(searchTxt){
        var searchVal = searchTxt;
			searchVal = searchVal.replace(/\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\=|\+|\||\;|\:|\'|\"|\,|\.|\<|\>|\?|\//g,' ');
			searchVal = searchVal.replace(/^\s*|\s*$/g,'');
			searchVal = searchVal.replace(/\s+|\/+|\\+/g,'-');
			searchVal = searchVal.replace(/-+/g,'-');
        return searchVal;
    }
    function loactions(searchShort,searchVal,cpath){
        if(cpath != '' && searchVal != ''){
            window.location.href = domain + searchShort+"search/"+searchVal+".html?cpath="+cpath;
        }else{
			if(searchVal != ''){
            	window.location.href = domain + searchShort+"search/"+searchVal+".html";
			}
        }
	}
	function arrSearchHis(){
		var searchString = decodeURI(TT_NS.cookie.get('TT_SEARCH_HISTORY'));
		var searchArr = searchString.split('|');
		return searchArr;
	}
	$('.clear_hiss').click(function(){
		TT_NS.cookie.del('TT_SEARCH_HISTORY');
		$('#recent_search,.m_search_help').hide();
		$('#search_guess').html('')
	})
	$('#search_guess').on('click','.icon_cross',function(){
		$(this).parent('li').remove();
		var delTxt = $(this).siblings('strong').text();
		var searchArr = arrSearchHis();
		for(var i=0; i<searchArr.length; i++) {//删除数组指定元素
			if(searchArr[i] == delTxt) {
				searchArr.splice(i, 1);
				break;
			}
		}
		var searchSt = searchArr.join('|');
		TT_NS.cookie.set('TT_SEARCH_HISTORY',encodeURI(searchSt));
	})
    searchC.click(function(){
		var searchTxt = $(".search_wrap").children("input[type='text']").val().toLowerCase();
        var shorts = searchShort();
        var vals = searchVal(searchTxt);
		var cpath = cpathVal();
        if(searchTxt != ""){
            loactions(shorts,vals,cpath);
        }else{
            $(".search_wrap").children("input[type='text']").focus();
        }
    })
    ////////enter键跳转
    var keyEnter = $(".search_wrap").children("input[type='text']");
    var keyword_Input;
    function check_search_keyword() {
        $(document).on("input propertychange", ".search_wrap input[type='text']", function() {
			$('.m_search_help').hide();
			if($('.search_wrap input[type="text"]').val() != ''){
				if($('.search_wrap input[type="text"]').val() != '' && $('#searchThink').length == 0){
					$(".m_search_help").append("<ul id='searchThink'></ul>");
				}
				var searchTxt = $(this).val().toLowerCase();
				var keyword = searchVal(searchTxt);
				var cid = $('.search_wrap .bm_option .result em').attr('data-cid');
				clearTimeout(keyword_Input);
				keyword_Input = setTimeout(function() {
					$.ajax({
						url : domain + 'index.php?r=search/default/ajaxkeyauto&keyword='+ keyword+'&categoryid='+cid +TT_NS.lactions.lang(),
						timeout : 10000,
						type : 'get',
						cache : false,
						dataType : 'html',
						success : function(html) {
                            if(html != ''){
								$('.m_search_help,#searchThink').show();
                                $("#searchThink").html(html);
                                $("#searchThink li").click(function(){
                                    var searchTxt = $(this).text();
                                    var shorts = searchShort();
									var vals = searchVal(searchTxt);
									var valsT = vals.replace(/-/g,' ');
									var cpath = cpathVal();
                                    keyEnter.val(valsT);
                                    loactions(shorts,vals,cpath);
                                })
                            }else{
                                $("#searchThink").hide()
                            }
						}
					});
				}, 300);
			}else{
                $("#searchThink").hide()
				searchHis();
			}
		});
	}
	check_search_keyword();
    function searchHis(){
		$('#searchThink').remove();
        if(TT_NS.cookie.get('TT_SEARCH_HISTORY')){
            $('.m_search_help,#recent_search').show();
			$("#searchThink").hide();
            var searchArr = arrSearchHis();
            $("#search_guess").show().html('');
            $.each(searchArr, function(i,value){
                $("#search_guess").append('<li><strong>'+value+'</strong><i class="icon_cross"></i></li>')
            })
            $("#search_guess li strong").click(function(){
                var searchTxt = $(this).text();
                var shorts = searchShort();
                var vals = searchVal(searchTxt);
				var valsT = vals.replace(/-/g,' ');
                var cpath = cpathVal();
                keyEnter.val(valsT);
                loactions(shorts,vals,cpath);
            })
        }else{
			$('.m_search_help,#recent_search').hide();
		}
    }
    keyEnter.focus(function(){
		if($('.search_wrap input[type="text"]').val() != '' && $('#searchThink').length == 0){
				$(".m_search_help").append("<ul id='searchThink'></ul>");
		}
        var searchTxt = keyEnter.val().toLowerCase();
		var keyword = searchVal(searchTxt);
		var cid = $('.search_wrap .bm_option .result em').attr('data-cid');
		////////////////================关键词 异步加载=====================
		$('.m_search_help').hide();
		if($('.search_wrap input[type="text"]').val() != ''){
			$('#recent_search').hide();
			$.ajax({
				url : domain + 'index.php?r=search/default/ajaxkeyauto&keyword='+ keyword + '&categoryid='+cid +TT_NS.lactions.lang(),
				timeout : 10000,
				type : 'get',
				cache : false,
				dataType : 'html',
				success : function(html) {
					if(html != ''){
						$('.m_search_help').show();
						$("#searchThink").show().html(html);
						$("#searchThink li").click(function(){
							var searchTxt = $(this).text();
							var shorts = searchShort();
							var vals = searchVal(searchTxt);
							var valsT = vals.replace(/-/g,' ');
							var cpath = cpathVal();
							keyEnter.val(valsT);
							loactions(shorts,vals,cpath);
						})
					}else{
						$("#searchThink").hide()
					}
				}
			});
		}else{
			searchHis()
		}
    })
    keyEnter.click(function(e){
   		EventHide.popCurrAndCountry();
		EventHide.popCategory();
        e.stopPropagation(); 
    })
    $("body").click(function(){
        $("#searchThink,.m_search_help").hide();
		$("#searchThink").remove();
    })
    keyEnter.keyup(function(event){
		if($('.search_wrap input[type="text"]').val() != ''){
			$('#recent_search').hide();
		}else{
			$('#searchThink').hide();
			if(TT_NS.cookie.get('TT_SEARCH_HISTORY')){
				$('.m_search_help,#recent_search').show();
			}
		}
        $this = $("#searchThink");
        if(!$this.is(":hidden")){
            var keys = {
                UP : 38,
                DOWN : 40,
                PAGEUP : 33,
                PAGEDOWN : 34
            };
            var kc = event.keyCode;
            if (kc == keys.UP || kc == keys.PAGEUP) {
                if ($this.find("li:first.active").length == 1 || $this.find("li.active").length == 0) {
                    $this.children().removeClass("active").last().addClass("active");
                } else {
                    $this.find("li.active").removeClass("active").prev().addClass("active");
                }
                var keywords = $this.find("li.active").html().replace(/<u>(.*)<\/u>/ig, '');
                keywords = keywords.replace(/(<[a-z0-9\/]+>)+/ig, '');
                $(this).val(keywords);
            }
            if (kc == keys.DOWN || kc == keys.PAGEDOWN) {
                if ($this.find("li:last.active").length == 1 || $this.find("li.active").length == 0) {
                    $this.children().removeClass("active").first().addClass("active");
                } else {
                    $this.find("li.active").removeClass("active").next().addClass("active");
                }
                var keywords = $this.find("li.active").html().replace(/<u>(.*)<\/u>/ig, '');
                keywords = keywords.replace(/(<[a-z0-9\/]+>)+/ig, '');
                $(this).val(keywords);
            }
        }
    })
    
    keyEnter.keypress(function(e){
        var key = e.which;
        if (key == 13) {
            var searchTxt = keyEnter.val().toLowerCase();
            var shorts = searchShort();
            var vals = searchVal(searchTxt);
            var cpath = cpathVal();
            if(searchTxt != ""){
                loactions(shorts,vals,cpath);
            }else{
                $(".search_wrap").children("input[type='text']").focus();
            }
            return false;
        }
    })
    //限制输入下划线 英文 和数字
    // keyEnter.keyup(function(){
        // this.value=this.value.replace(/[^-_.,#\s\$\/&a-zA-Z0-9]+$/g,'');
    // })

})

/**
 * @desc 方法
 */
//改变图片显示方式
function eachImg(boxClass){
	boxClass.find("img.lazy").each(function(){
	    $(this).attr("src",$(this).attr("data-original"));
	    $(this).removeAttr("data-original");
	});
}


$(function(){
//显示购物车
	var cartData = true;
    var num = $(".cart_total");
    if(TT_NS.cookie.get("CART_COUNT")){
        var carNums = TT_NS.cookie.get("CART_COUNT");
        num.text(carNums);
    }else{
        num.text(0);
    }
	$(".m_head_cart").mouseenter(function(){
		if(cartData == true){
			showCart();
		}
		cartData = false;
	})
	$(".m_head_cart").mouseleave(function(){
		cartData = true;
	})
//导航deals margin-left
	$(".dealsNav").prev("a").mouseover(function(){
		var dealsW = $(".dealsNav").width();
		$(".dealsNav").css({"margin-left":-dealsW/2+70})
	})
})
function appendEmpty(){
	var shorts = TT_NS.lactions.langShort();
	if(shorts == ''){
		shorts = '';
	}else{
		shorts = shorts+'/';
	}
	$(".cart_menu").html('').append('<span class="icon icon_arr_top"></span><div class="noneProduct">'+strFun("TT_language_"+jsLanguage)["tomtop.message.shoppingCartIsEmpty"]+'</div><div class="cart_view"><a href="'+domain + shorts + '" class="btn btn-orange">'+strFun("TT_language_"+jsLanguage)["tomtop.common.continueShopping"]+'</a></div>');
};
function dlCart(){
	$(".dlCart").click(function(){
		$(this).unbind("click");
		var dels = $(this).parents("li");
		var listingID = $(this).attr("listing_id");
		var TT_warehouse = $(this).attr("TT_warehouse");
		$.ajax({
		   type: "GET",
		   url: domain+"index.php?r=cart/default/ajaxdeletecart"+TT_NS.lactions.lang(),
		   timeout : 10000,
		   data: {listing_id:listingID,TT_warehouse:TT_warehouse},
		   cache : false,
		   dataType:'json',
		   success: function(data){
		   		if(data.ret == 1){
		   			var num = $(".cart_total")
		   			var nums = parseInt(num.text())-1;
                    TT_NS.cookie.set("CART_COUNT",data.data);
		   			if(nums<=0){nums=0}
		   			num.text(nums)
		   			$("#item").text(nums);
		   		}
		   }
		});
		if(dels.siblings('li').length == 0){
			$(this).parents('.cart_detail').remove();
		}else{
			dels.remove();
		}
		if($('.cart_detail_list').length == 0){
			appendEmpty();
		}
	})
}
function showCart(){
	if($(".cart_menu").children().length==0){
		$(".cart_menu").append("<div class='loading-ajax' />")
	}
	$.ajax({
		type : 'get',
		url : domain+'index.php?r=cart/default/ajaxshowcart'+TT_NS.lactions.lang(),
		cache : false,
		success : function(res){
			if(res.count == 0){
				if($(".noneProduct").length < 1){
					appendEmpty();
				}
			}else{
				$('.cart_menu').html(res.result);
			}
			$('.cart_total').text(res.count);
			TT_NS.cookie.del('CART_COUNT');
			TT_NS.cookie.set('CART_COUNT',res.count);
			dlCart();
			$(".loading-ajax").remove();
		},
		error :function(XMLHttpRequest, textStatus, errorThrown){
			html = '<div class="noneProduct">'+errorThrown+'</div>';
			$('.cart_menu').html(html);
		},
		dataType : 'json'
	});
}
/**
 * 邮箱验证  
 */
function ischeckemail(){
    var email = document.getElementById("subEmail").value;
    if (email != "") {
        // var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
		// isok= reg.test(email );
        if (TT_NS['check']['email'](email) == false) {
            Dialog(function(){
                var con = $(this).parents(".pu_pop");
                con.fadeOut(function(){
                    con.remove();
                    $("#subEmail").focus();
                });
            },strFun("TT_language_"+jsLanguage)["tomtop.common.tip"],strFun("TT_language_"+jsLanguage)["tomtop.message.wrongEmail"]);
        }else{
            window.location.href = TT_CONFIG.subscribeUrl + "/loyalty/subscribe?em="+TT_NS.base64.base64Encode(email);
        }
    }else{
        Dialog(function(){
            var con = $(this).parents(".pu_pop");
            con.fadeOut(function(){
                con.remove();
                $("#subEmail").focus();
            });
        },strFun("TT_language_"+jsLanguage)["tomtop.common.tip"],strFun("TT_language_"+jsLanguage)["tomtop.message.enterYourEmail"]);
    }
};
//ajax登录
// function ajaxSig(logins){
// 	var email = $.trim(logins.find('#sign_email').val());
// 	var pw = logins.find('#sign_password').val();
// 	var eErrHtml = logins.find("#sign_email").next(".help-block");
// 	var eErrCss = logins.find("#sign_email").parents(".controls");
// 	var pErrHtml = logins.find("#sign_password").next(".help-block");
// 	var pErrCss = logins.find("#sign_password").parents(".controls");
// 	// var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
// 	if (email != "") {
// 		// isok= reg.test(email );
// 		if (TT_NS['check']['email'](email) == false) {
// 			eErrHtml.html(strFun("TT_language_"+jsLanguage)["tomtop.message.wrongEmail"]);//您输入的邮箱格式不正确
// 			eErrCss.addClass("error");
// 		}else{
// 			eErrCss.removeClass("error");
// 			eErrHtml.html("");
// 		}
// 	}else{
// 		eErrHtml.html(strFun("TT_language_"+jsLanguage)["tomtop.message.enterYourEmail"]);//请输入您的邮箱
// 		eErrCss.addClass("error");
// 	}
// 	if(pw == ""){
// 		pErrHtml.html(strFun("TT_language_"+jsLanguage)["tomtop.message.enterYourPassword"]);//请输入您的密码 
// 		pErrCss.addClass("error");
// 	}else{
// 		pErrCss.removeClass("error");
// 		pErrHtml.html("");
// 	}
// 	logins.find("#sign_email,#sign_password").focus(function(){
// 		$(this).siblings(".help-block").text("");
// 		$(this).parents(".controls").removeClass("error");
// 	})
// 	if(logins.find('.error').length == 0){
// 		var backUrls = TT_NS.cookie.get('TT_REDIRECT_URL');
// 			backUrls = backUrls.split('#')[0];
// 			jQuery.getScript(TT_CONFIG.signUrl + '?em='+TT_NS.base64.base64Encode(email) + '&pw='+TT_NS.base64.base64Encode(pw)+'&backUrl='+ backUrls,function(){
// 			if(data.ret == 1){
// 				$('.signJoin .controls').addClass('success');
//                 if(data.backUrl == ''){
//                     window.location.reload();
//                 }else{
//                     window.location.href = backUrls;
//                 }
//                 pErrHtml.html("");
//                 eErrHtml.html("");
//             }else{
//                 if(reg.test(email) && pw != ""){
//                     eErrCss.addClass("error");
//                     pErrCss.addClass("error");
//                     pErrHtml.html(strFun("TT_language_"+jsLanguage)["tomtop.message.usernameOrPassword"]);//您输入的用户名或密码不正确
//                 }
//             }
//         });
// 	}
// }
// $(function(){
// 	$('#signin').click(function(){
// 		ajaxSig($(".pu_blockWarp"));
// 	});
// 	var keyEnter = $("#sign_password,#sign_email");
// 	keyEnter.keypress(function(e){
// 		var key = e.which;
// 		if (key == 13) {
// 			ajaxSig($(".pu_blockWarp"));
// 	        return false;
// 	    }
// 	})
// })


/////======================公用弹框================================

function successful(){
	var params ={content:strFun("TT_language_"+jsLanguage)["tomtop.common.successfully"]+'!'};	
	params = $.extend({'position':{'zone':'center'},'overlay':true}, params);
	var markup = [
        '<div class="successfulPop_box">',
			'<div class="checkbox"></div>',
			'<p>',params.content,'</p></div>'
    ].join('');
    $(markup).hide().appendTo('body').fadeIn();
    setTimeout(function () { 
        $('.successfulPop_box').fadeOut(function(){$('.successfulPop_box').remove()});
    }, 1000);
}
function errorPop(){
	var params ={content:strFun("TT_language_"+jsLanguage)["tomtop.common.error"]+'!'};	
	params = $.extend({'position':{'zone':'center'},'overlay':true}, params);
	var markup = [
        '<div class="errorPop_Box">',
			'<div class="checkbox"></div>',
			'<p>',params.content,'</p></div>'
    ].join('');
    $(markup).hide().appendTo('body').fadeIn();
    setTimeout(function () { 
        $('.errorPop_Box').fadeOut(function(){$('.errorPop_Box').remove()});
    }, 1000);
}


/////======================登陆弹出公用框==================================
function randomNumber(){
    return Date.parse(new Date());
}
$(function(){
    var titerHref = $('.icon-tw').attr('href');
    $('.icon-tw').attr('href',titerHref+ '?' +randomNumber());
})

/////======================getuser 登陆状态==================================
function getuser(){
	$.ajax({
		type: "GET",
		cache : false,
		url: domain+"index.php?r=member/default/getuser"+TT_NS.lactions.lang(),
		dataType:'json',
		success: function (data) 
		{
			if(data.status == 1){
				var wholBox = $('.wholesale_left');
				var qaBox = $('#askQuestion');
				var inf = JSON.parse(data.account_info);
				$('body').append('<input id="userEmail" type="hidden" value="'+ inf.email +'">');
				if($('.navFixedTop').length == 1){
					wholBox.find('input[name=name]').val(inf.account);
					wholBox.find('input[name=emailAddress]').val(inf.email);
					qaBox.find('input[name=name]').val(inf.account);
					qaBox.find('input[name=email]').val(inf.email);
				}
				if(TT_NS.cookie.get('TT_COUN')){
					var curr = $('.all_country').eq(0).find('.flag_'+TT_NS.cookie.get('TT_COUN')).children('span').text();
					var counState = wholBox.find('input[name=countryState]');
					counState.val(TT_NS.cookie.get('TT_COUN'));
					counState.parent('span').removeClass().addClass('flag_'+ TT_NS.cookie.get('TT_COUN'));
					//counState.attr('data-code',getCookie('TT_COUN'));
					counState.siblings('.country_txt').text(curr);
				}
				$("#account_info").html('<i class="icon_myaccount lineBlock"></i><a>' + data.result+'</a>');
				$('.signIn').addClass('hide');
				$('.acount_link').removeClass('hide');
			}
		},
		error: function(){
			$('.signIn').removeClass('hide');
			$('.acount_link').addClass('hide');
		}
	});
}
getuser();

/////======================选择国家 Ship to==================================

$(function(){
	 function shipTo(){
		 $.ajax({
		    type: "GET",
			cache : false,
		    url: domain+"index.php?r=site/shipto"+TT_NS.lactions.lang(),
		    dataType:'json',
			 success: function (data){
			 	if(data.status == 1){
					 var countryName = $(".all_country").eq(0).children('.' + data.code).children('em').text();
					 $("#current_country_flage").removeClass().addClass(data.code).attr('data-code', data.code);
					 $('.m_pullDown_country .result').removeClass().addClass('result ' + data.code);
			 		if(data.code=="CN"){
			 			$(".m_shipto_wrap").find(".flag_Txt").text("China");
                        $('.tt_ns_shipping_to').find(".flag_Txt").text('China');
						$(".country_txt").text("China");
						$('.m_pullDown_country .result em').text("China");
			 		}else{
			 			$(".m_shipto_wrap").find(".flag_Txt").text(countryName);
			 			$('.tt_ns_shipping_to').find(".flag_Txt").text(countryName);
                        $(".country_txt").text(countryName);
						$('.m_pullDown_country .result em').text(countryName);
			 		}
			 	}
			 }
		 });
	 }
	 shipTo();
})
function visitWeb(){
	if(TT_NS.cookie.get("AID") && request('aid') == ''){
		var aid = TT_NS.cookie.get("AID");
	}else if(request('aid') != ''){
		var aid = request('aid');
	}else{
		var aid = '';
	}
	var url = window.location.href;
	 $.ajax({
	    type: "GET",
	    url: domain+"index.php?r=site/visit"+TT_NS.lactions.lang(),
	    data:{aid:aid,url:url},
	    dataType:'json',
		 success: function (json) 
		 {
		 }
	 });
}
visitWeb();

//================================================================================对话框黑底显示/隐藏
function fnDialogsBg(custom){
	//显示/隐藏对话框黑底:fnDialogs(1.不设置值为自动切换,2.'hide'为隐藏,3.'show'为显示)
	if(custom){
		if(custom=='hide'){
			fnfnDialogBgsHide();
		} else if(custom=='show'){
			fnDialogsBgShow();
		}
	} else{
		if($('#bm_dialogs_bg').length==0 || $('#bm_dialogs_bg').css('display')=='none'){
			fnDialogsBgShow();
		} else{
			fnDialogsBgHide();
		};
	};
};
function fnDialogsBgHide(){
	//隐藏对话框黑底
	$('#bm_dialogs_bg').css('display','none');
	//$('html').css('overflow-y','auto');
};
function fnDialogsBgShow(){
	//显示对话框黑底
	if($('#bm_dialogs_bg').length==0){
		var newElems=$('<div id="bm_dialogs_bg"></div>');
		$('body').append(newElems);
	} else{
		$('#bm_dialogs_bg').css('display','block');
	}
	//$('html').css('overflow-y','hidden');
	$('#bm_dialogs_bg').click(fnDialogsBgHide);
};
//================================================================================点击黑底关闭对话框
$(document).on('click','#bm_dialogs_b,#bm_dialogBg,#bm_dialogs_bg',function(){
	fnDialogsBgHide();
});
$(document).on('click','.dialogs,.bm_dialog',function(){
	fnCloseDialogs($(this));
});
$(document).on('click','.close_dialogs,.continueShopping',function(){
	var obj=$(this).parents('.dialogs');
	fnCloseDialogs(obj);
});
$(document).on('click','.close_dialog',function(){
	var obj=$(this).parents('.bm_dialog');
	fnCloseDialogs(obj);
});
$(document).on('click','.dialogs_c,.dialog_c',function(e){
	e.stopPropagation();
});
function fnCloseDialogs(obj){
	fnDialogsBg();
	obj.removeClass('dialogs_show');
};

//显示视频
$(document).on('click','.show_video_btn',function(){
	 fnDialogsBg();
	 $("#dialog_video").addClass('dialogs_show');
});
//===============================================================================IE低版本提示
$(function(){
	fnBrowserV(function(v){
		if(v){
			var newElems=$('<div class="dialogs dialogs_show">' +
								'<i></i>' +
								'<span class="dialogs_c iev">' +
									'<p>Your browser is an expired version, please update it  to view this page.</p>' +
									'<i class="close_dialogs"></i>' +
								'</span>' +
							'</div>');
			$('body').append(newElems);
			fnDialogsBg();
		};
	});
});

function fnBrowserV(fn){
	if(window.navigator.userAgent.indexOf("IE") !== -1){
		var browser=navigator.appName;
		var b_version=navigator.appVersion;
		var version=b_version.split(";");
		var trim_Version=version[1].replace(/[ ]/g,"");
		if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE4.0")
		{
			fn(true);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE5.0")
		{
			fn(true);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0")
		{
			fn(true);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0")
		{
			fn(true);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0")
		{
			fn(false);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0")
		{
			fn(false);
		}
		else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE10.0")
		{
			fn(false);
		}
	}
}
likesFun = {
	init:function(){
		// TT_NS.cookie.del('TT_REDIRECT_URL_TRUE');
		// $('.preorderID').click(function(){
		// 	TT_NS.cookie.tem('TT_REDIRECT_URL_TRUE','yes');
		// })
		$(".heartClick").click(function(){
			if(TT_NS.cookie.get('LOGIN_TOKEN') != null){
				var listingId = $(this).attr('data-rel');
				var TT_UUID = TT_NS.cookie.get("LOGIN_TOKEN");
				var _this = $(this);
				var data = {listingId:listingId ,TT_UUID:TT_UUID};
				$.post(domain+"index.php?r=details/default/ajaxcollect",data,function(result){
                    fnDialogsBg();
                    addHeartAjax();
                    $("#add_p_info").addClass('dialogs_show');
                    $('.addCartInf').hide();
                    $('.addHeartInf').show();
					if(result.status == 1){
					    if(_this.hasClass('productHeart') == true){
					        Ri = $('.favoritesC').children("i");
							var hartNum = parseInt($(".heartNumber").text().replace(/\(/,""))
							$('.favoritesC').children(".icon_wishlist").addClass("icon_wishlists").removeClass("icon_wishlist");
                            $(".heartNumber").html('(' + (hartNum + 1)+ ')');
					    }else{
                            var hartNum = _this.children(".addHeartNum");
						    hartNum.text(parseInt(hartNum.text())+1);
						}
                        $('.newHeart').show();
                        $('.tooHeart').hide();
					}else{
                        $('.newHeart').hide();
                        $('.tooHeart').show();
					}
				},"json");
			}else{
				TT_NS.cookie.tem('TT_REDIRECT_URL',window.location.href);
				window.location.href = TT_CONFIG.loginUrl;
			}
		})
	}
}
//  likes
$(function(){
	likesFun.init();
})
function addHeartAjax(){
   if ($('.m_product_scroll').children().length == 0 && TT_NS.cookie.get("WEB-history")) {
        var listingID = TT_NS.cookie.get("WEB-history").split(',')[0];
        var urls = ajaxLang("index.php?r=site/ajaxyoumightlike&position=foot");
        $.ajax({
           type: "GET",
           cache: false,
           url: urls + TT_NS.lactions.lang(),
           data: {listing_id:listingID},
           dataType:'html',
           success: function(html){
                $('.m_product_scroll').html('<div class="listMoveWarp AlsoBought"><div class="lbBox listPageTitle"><p class="lineBlock">You may also like</p></div>'+html+'</div>');
                $(".m_product_scroll img.lazy").lazyload();
				$('.m_product_scroll .moveHidden').carousel({
					_height    : '',
					_leftBtnShow: 'on',
					_leftClass : 'leftArr',
					_rightClass: 'rightArr',
				});
           }
        });
    }
}

$(function(){
	/**
	 * @desc 关键词添加评分
	 */
	$('.search_hot').on('click','.clickMore',function(){
		$(this).parents('.search_hot').find('.hide').removeClass('hide').addClass('show');
		$(this).removeClass('show').addClass('hide');
	});
	$('.search_hot').on('click','.clickLess',function(){
		$(this).parents('.search_hot').find('.show').removeClass('show').addClass('hide');
		$(this).parents('.search_hot').find('.clickMore').removeClass('hide').addClass('show');
		$(this).removeClass('show').addClass('hide');
	});
	
	//弹出类别项目弹窗部分
	$('.search_wrap .bm_option .result').on('click',function(){
		$(this).siblings('.option_list').toggle();
		$('#searchThink').remove();
		$('.m_search_help').hide();
	});
	
	$('.option_list a').on('click',function(e){
		var sortVal = $(this).html();
		var cpath = $(this).attr('cpath');
		var cId = $(this).attr('cid');
		var findEm = $(this).parents('.search_wrap').find('.result em');
		findEm.html(sortVal);
		findEm.attr('data-path',cpath);
		findEm.attr('data-cid',cId);
		$(this).parents(".option_list").hide();
		e.stopPropagation();
	});
	$(document).on('click',function(){
		$('.search_wrap .option_list').hide();
	});
	$(".search_wrap").on('click',function(e){
		EventHide.popCurrAndCountry();
		e.stopPropagation();
	});
});

//品牌相关js
var brand={
	 init:function(){
     this.brandScroll();
     this.showMoreInfo();
	 },
     'brandScroll':function(){
 	   //品牌滚动
 	//    try{moveBox($(".viewedWarpBrand"));}catch(e){};
		$('.viewedWarpBrand .moveHidden').carousel({
			_height    : '',
			_leftBtnShow: 'on',
			_leftClass : 'leftArr',
			_rightClass: 'rightArr',
		});
     },
	'showMoreInfo':function(){
     	 	 //品牌信息查看更多
             var brandCH = $(".brand_introContent").height();
		     var readMoreBtn = $(".red_more_btn");
		     var redMoreBtn = $(".red_more_btn");
		     if(brandCH > 80){
		        $(".brand_infoWrap").css('height',80+'px');
		        redMoreBtn.show();
		     }else{
		        redMoreBtn.hide();
		     }
		     readMoreBtn.click(function(){
		     	var viewMore = $(this).attr('data-viewMore');
		     	var viewLess = $(this).attr('data-viewless');
		     	var str = $(this).text().toLowerCase();
		     	if(str == viewMore.toLowerCase() ){
		     		$(".brand_infoWrap").css('height',brandCH+'px');
		            $(this).text(viewLess)
		     	}else{
		     		$(".brand_infoWrap").css('height',80+'px');
		            $(this).text(viewMore)
		     	}
		     })
    }
}
$(function(){
   brand.init();
})

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


var TT_NS = (function(NS, $){
	NS['address'] = 
    {
        'init':function(){
             var _this = this;
             _this.checkPhoneNumber();
             _this.checkPostCode();
             _this.creatRegion();
        },
        /**
         * @名称:checkPhoneNumber
         * @作者：wxl
         * @日期：20161122
         * @参数: 无
         * @描述: 验证添加地址的时候对电话号码进行输入限定,只允许输入数字。
         * @返回: NS['address'].checkPhoneNumber();
        */
        'checkPhoneNumber':function(){
               $(document).on('input propertychange','.m_set_address .phone_val',function(){
                   var txt=$(this).val();
                   var lastVal=txt.replace(/[^\d]{1,30}/gi,'');
                   $(this).val(lastVal);
               })
              
        },
         /**
         * @名称:checkPostCode
         * @作者：wxl
         * @日期：20161122
         * @参数: 无
         * @描述: 验证添加地址的时候的邮政编码的格式
         * @返回: NS['address'].checkPhoneNumber();
        */
        'checkPostCode':function(){
               //邮政编码正则输入判断
               $(document).on('input propertychange','.m_set_address .postCode_val',function(){
                  var txt=$(this).val();
                  var lastVal=txt.replace(/(^[^A-Za-z0-9]+)|([^\s\w-]+)|[/_]/gi,'').replace(/[\s-]{2,}/gi,'')
                  .replace(/([\s\w-]{1,20})(.*)/,'$1');
                  $(this).val(lastVal);
               })
               $(document).on('blur','.m_set_address .postCode_val',function(){
                   var txt=$(this).val();
                   var txtVal=txt.substring(txt.length-1,txt.length);
                    if(txtVal==' '||txtVal=='-'){
                      var strLast=txt.substring(0,txt.length-1);
                      $(this).val(strLast);
                    }
               })
              
        },
        /**
         * @名称:creatRegion
         * @作者：wxl
         * @日期：20161122
         * @参数: 无
         * @描述: 联动创建国家对应的州以及添加电话号码前缀。
         * @返回: NS['address'].checkPhoneNumber();
        */
        'creatRegion':function()
        {
            var _this = this;
            var hasRegion = null;
            $(document).on('click','.m_set_address .all_country li',function(){
               var str = $('.m_set_address .phone_val').val();
               var postCode = $(this).attr("areacode");
               var countryCode = $(this).attr("countrycode");
               var countryId  = $(this).attr("countryid");
               $('.region_wrap').find('.region_val').removeAttr('readonly');
               if(postCode != '')
               {
                  var rstr = postCode + str;
                  $('.m_set_address .phone_val').val(rstr);//设置邮件前缀
               } 
               $('.m_set_address .region_val').val('');
               $('.region_wrap .arrow').hide();
               $('.region_wrap').find('.region_more').hide();
               $.ajax({
                type : 'GET',
                url  : '/customer/address/ajax-get-province',
                data : {'countryId':countryId},
                dataType : 'json',
                success : function(data)
                {
                    if (data.ret == 1) 
                    {
                      var temp = '';
                      for(var i in data.data)
                      {
                          temp += '<li><span>'+data.data[i].name+'</span></li>';
                      }
                      $('.region_wrap ul').empty().html(temp);
                      if (temp != '') 
                      {
                        $('.region_wrap').find('.region_val').attr('readonly','readonly');
                        $('.region_wrap .arrow').show();
                        $('.region_wrap').find('.region_more').show();
                        $('.region_wrap .arrow').toggleClass('up'); 
                      }
                    }
                }
               });

               hasRegion = $('.region_wrap .arrow').css('display');
            })
            if(hasRegion!='none')
            {
                _this.ulSelect();
            }

        },
        /**
         * @名称:ulSelect
         * @作者：wxl
         * @日期：20161122
         * @参数: 无
         * @描述: 选择国家对应的州
         * @返回:
        */
        'ulSelect':function(){
            $(document).on('keyup','.region_more .search_region',function(){
                var strA=$(this).val().toLowerCase();
                var obj=$(this).parents('.region_more').find('li');
                obj.each(function(){
                    var strB=$(this).find('span').text().toLowerCase();
                    if(strB.search(strA)!=-1){
                        $(this).show();
                    }else{
                        $(this).hide();
                    }
                });
            });
            
            $(document).on('click','.region_wrap .region_val,.region_wrap .arrow',function(){
                var oP = $(this).parents('.region_wrap').find('.region_more');
                if(oP.find('li').size()>0){
                    oP.slideToggle();
                    $('.region_wrap .arrow').toggleClass('up');
                }
            });
            $(document).on('click','.region_wrap ul li',function(e){
                e.stopPropagation();
                $(this).parents('.region_more').slideToggle();
                $('.region_wrap .arrow').toggleClass('up'); 
                var val = $(this).text();
                $(this).parents('.region_wrap').find('.region_val').val(val);
            });
            $(document).on('mouseleave','.region_wrap',function(){
                $(this).find('.region_more').slideUp();
                $('.region_wrap .arrow').removeClass('up'); 
            });
        }
    }     
    NS['address'].init();
    return NS;
})(window.TT_NS || {}, jQuery);

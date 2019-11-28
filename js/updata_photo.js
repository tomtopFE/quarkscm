/**
 *@模块： TOMTOP使用的命名空间为TT_NS
 *@作者： caoxl
 *@日期： 2016-06-29
 */
var TT_NS = TT_NS || {};

/**
 *@名称:  TT_GET
 *@作者： caoxl
 *@日期： 2016-06-29
 *@参数:  String name 模块名称
 *@描述： 该函数是获取TT_NS命名空间下的模块
 *        注意不要直接使用TT_NS.xxx 以免将来TT_NS发生改变
 *@返回:  mixed
 */
var TT_GET = TT_GET || function(name){
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
    NS['config'] = NS['config'] || {};
    NS['config']['isUpoad'] = false;
    NS['config']['uploadFile'] = '';
    NS['styleUpload'] = {
       'inputFile' : $('#filepath'),
        init:function(){
            var _this = this;
            $(".delete_photo").click(function(){
                NS.config.isUpoad = false;
                $(this).parents(".preview_pic").find("img").attr('src','');
                $(this).parents(".upload").find(".success_info").hide();
                $(this).parents(".upload").find(".upload_btn").show();
                $(this).parents(".upload").find(".preview_wrap").hide();
                $(".success_info").hide();
                $("#show_error").hide();
                _this.clear();
            })
            $('#filepath').change(function(){
                var id = $(this).attr('id');
                $(this).parents(".upload").find(".upload_btn").hide();
                $(this).parents(".upload").find(".preview_wrap").show();
                $(this).parents(".upload").find(".uploading_tips").show();
                NS.styleUpload.validateImage(this, 'prv' + id);
            });
            //提交
            $(".m_upload_c").on('click',".next",function(){
                var next = 0;
                if($('.bm_checkbox').find('span').hasClass('checkboxed')){
                    $(".checkbox_error_info").hide();
                }else{
                    $(".checkbox_error_info").show();
                    next++;
                }
                if(NS.config.isUpoad == true && $(".preview_pic").find('img').attr('src')){
                    $(".upload_error_info").hide();
                }else{
                    if(!$(".preview_pic").find('img').attr('src')){
                        $(".upload_error_info").show();
                    }
                    next++;
                }
                if(next==0){

                    window.location = TT_NS.config.webLangUrl + '/stylegallery/upload/?p=part2';

                }else{
                    return false;
                }

            });
            $(".Cancel").click(function(){

                window.history.go(-1);

            });

            $('.bm_checkbox').click(function(){
                if(!$('.checkbox_error_info').is(":hidden")){
                    $(".checkbox_error_info").hide();
                }
            });

        },
        validateImg:function(data) {//验证图片类型。
            var pos = data.indexOf(",") + 1;
            var filters = {
                // "jpeg": "/9j/4",
                // "gif": "R0lGOD",
                // "png": "iVBORw",
                "pdf": "JVBERi0xL"
            }
            for (var e in filters) {
                if (data.indexOf(filters[e]) === pos) {
                    return e;
                }
            }
            return null;
        },
        clear: function() {//清除上传控件。
            var inputClone = this.inputFile.clone(true);
            inputClone.val('');
            this.inputFile.after(inputClone);
            this.inputFile.remove();
            this.inputFile = inputClone;
        },
        showPrvImg: function(src, prid) {
            $('#' + prid).attr('src', src);
            // imgnative.nativemaxwidth(".pic");
        },
        checkSize: function(data){
            var size = (data.size / 1024)/1024;
            if (size < 100) {
                    return true;
               }else{
                    return false;
            }
        
        },
        validateImage: function (a, prid) {//预览图片
            var file = a;
            var tip = "format:pdf!"; // 设定提示信息
            var prvbox = $('#' +　prid);
            prvbox.empty();
            if (window.FileReader) { // html5方案
                for (var i=0, f; f = file.files[i]; i++) {
                    var fr = new FileReader();
                    fr.onload = function(e) {
                        var src = e.target.result;
                        if (!NS.styleUpload.validateImg(src)) {
                            $("#show_error").show().html(tip);
                        }else if(!NS.styleUpload.checkSize(file.files[0])){
                            $("#show_error").show().html("not bigger than 100M");
                            NS.styleUpload.showPrvImg('/', prid);
                        } else {
                            //这里处理上传逻辑
                                var upImage = new Image();
                                 upImage.src = src;
                                 upImage.onload = function () {
                                      var w = upImage.width;
                                      var H = upImage.height;
                                      console.log(w +":"+ H);
                                      if(w >= 0 && H >= 0 ){
                                          NS.styleUpload.showPrvImg(src, prid);
                                          $("#show_error").hide().html("");
                                          if($("#show_error").css('display')=='none'){
                                             NS.styleUpload.upload(src);  
                                          }
                                      }else{
                                         NS.styleUpload.showPrvImg(' ', prid);
                                         $("#show_error").show().html("not bigger than 2M");
                                         $(".uploading_tips").hide();
                                         return false;
                                      }
                                }
                                                     
                        }
                    }
                    fr.readAsDataURL(f);
                }
            } else { // 降级处理
                if ( !/\.jpg$|\.png$|\.gif$/i.test(file.value) ) {

                } else {
                    $("#error_info").hide();
                    NS.styleUpload.showPrvImg(file.value, prid);
                }
            }
        },
        upload:function(data){
            // dataURL 的格式为 “data:image/png;base64,****”,
            // 逗号之前都是一些说明性的文字，我们只需要逗号之后的就行了

            console.log(data);
            data=data.split(',')[1];
            data=window.atob(data);
            var ia = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
                ia[i] = data.charCodeAt(i);
            };
            var blob = new Blob([ia], {type:"image/png"});
            var fd = new FormData();
            fd.append("upload", 1);
            fd.append('file',blob);
            $.ajax({
                url: '/stylegallery/ajaxupload/',
                type: "POST",
                processData: false,
                contentType: false,
                data: fd,
                dataType:'json',
                success:function(result) {
                    //console.log(result.errorCode);
                    $(".uploading_tips").hide();
                    if(result.ret == 1){
                        $("#prvfilepath").attr("src",result.uploadFile);
                        $(".success_info").show();
                        NS.config.isUpoad = true;
                        NS.config.uploadFile = result.uploadFile;
                    }else{
                        $("#show_error").html('<i></i>Upload failed ,please select eligible  photos ').show();
                    }
                    $(".upload_error_info").hide();
                }

            });
        }
    };
    return NS;
})(window.TT_NS || {}, jQuery);
TT_GET('styleUpload').init();

    

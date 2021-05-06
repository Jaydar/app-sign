
var dico = {

    init:function() {

        

        // if(dico.is_IOS()){
        //     if(id=='5d68d9089a9ff06fab4b3782'){
        //         dico.jump('https://www.appstore.ski/private/app/#/f6002c40deae0d558149e2dd70d039b5');
        //         return;
        //     }else{
        //         dico.jump('https://www.appstore.ski/app/#/00bbdcb4e135a8763fb013647abd8a1f');
        //     }
        //     return;
        // }

        window.$ = function(selecter){return document.querySelector(selecter)};

        if(dico.is_PC()){
            $('.mask').style.display = "block";
            $('#qrcode').src = 'https://super.ancpoker.com/qrcode?url='+window.location.href;
        }
        if (dico.is_IOS() && !dico.is_inSafari() ) {
            $('.install').textContent = '请在Safari打开';
            $('.wechat-tips').style.display = 'block';
            document.getElementById('ios_tips').removeAttribute('hidden')
        }

        if (dico.is_weixin()) {
            $('.install').textContent = '不支持微信內安裝';
            $('.wechat-tips').style.display = 'block';
            if (dico.is_IOS()) {
                document.getElementById('ios_tips').removeAttribute('hidden')
            } else {
                document.getElementById('android_tips').removeAttribute('hidden')
            }
        }

        $('.install').addEventListener('click', function (e) {
            if (dico.is_weixin()) {
                e.preventDefault()
                return
            }
            if (dico.is_IOS()) {
                if(e.target.dataset.ios){
                    dico.jump(e.target.dataset.ios);
                }
                else{
                    if(e.target.dataset.type=='sign'){
                        dico.install(e.target.dataset.url);
                    }else{
                        dico.download(e.target.dataset.url);
                    }
                }

            } else {
                dico.jump(e.target.dataset.android);
            }
        })
    },

    install:function(url){
        dico.jump(url);
        setTimeout(function () {
            dico.jump('/toSet')
        },3000)
    },
    download:function(url){
        $('.install').innerText = '安装中...';
         window.location.href = 'itms-services://?action=download-manifest&url='+(url);
        setTimeout(function(){
            $('.install').innerText = '请返回桌面查看';
        },20*1000)
    },

    jump:function(url){
        var element = document.createElement('a');
        element.style.display = 'none';
        element.href = url;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    is_inSafari(){
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /(iPhone|iPad|iPod|iOS)([\s\S]+)(Mobile)([\s\S]+)(Safari)/i.test(userAgent) ? true : false;
    },

    is_weixin:function() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        var ua = userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    },
    is_IOS:function(){
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /(iPhone|iPad|iPod|iOS)/i.test(userAgent) ? true : false;
    },
    is_Android:function(){
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android/i.test(userAgent.toLowerCase()) ? true : false;
    },
    is_PC:function(){
        return !dico.is_IOS() && !dico.is_Android() ? true : false;
    }
}

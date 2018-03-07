var limit = 20
$(function() {
	jQuery.support.cors = true;
	//检测权限
	checkEdit()
	//检测是否登录
	var token = '';
	if(sessionStorage) {
		token = sessionStorage.getItem("token");
	} else {
		token = getCookie('token');
	}
	if(!token) {
		window.location.href = 'login.html';
	}
	//隐藏账户信息
	$(document).on('click', function(e) {
		var showalert = window.parent.document.getElementsByClassName('showalert');
		$(showalert).hide();
		$('.scanningAlert_typebox').hide();
		$('.typeboxs').hide();
		$('#nameSelect').hide();
		$('#nameUl').hide();
		$('.selectUl').hide();
	})
	//检查版本
	var versionState = '';
	if(sessionStorage) {
		versionState = sessionStorage.getItem('versionState');
	} else {
		versionState = getCookie('versionState');
	}
	if(versionState == 1) {
		var txt = '当前版本低于服务器版本';
		window.wxc.xcConfirm(txt, "confirm");

	}
	if(versionState == 2) {
		var txt = '当前版本高于服务器版本';
		window.wxc.xcConfirm(txt, "confirm");

	}
	if(sessionStorage) {
		sessionStorage.removeItem('versionState');
	} else {
		versionState = clearCookie('versionState');
	}
})
//去除视频右键事件
$("video").on("contextmenu", function() { //取消右键事件
	return false;
});
//检测汉字
function CheckChinese(val) {　　
	var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");　　
	if(reg.test(val)) {
		return true;
	} else {
		return false;
	}
}

function getStrLen(str) {
	var len = 0;
	for(var i = 0; i < str.length; i++) {
		if(str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
}
//检测非法字符
function checkString(str) {
	var regEn = /[`~!@#$%^&*()_+<>?:"{}.\/;'[\]]/im,
		regCn = /[·！#￥（——）：；“”‘|《。》？、【】[\]]/im;
	if(regEn.test(str) || regCn.test(str)) {
		return false;
	} else {
		return true;
	}
}

function myAjax(oldurl, type, data) {
	var dtd = $.Deferred();
	var type = type.toLocaleUpperCase();
	var url = window.localStorage["ip:port"] + oldurl;
	var token = '';
	if(sessionStorage) {
		token = sessionStorage.getItem('token');
	} else {
		getCookie('token');
	}
	var timestamp = Date.parse(new Date());
	var hashkey = type + "," + oldurl + ",{" + timestamp + "}";
	var sha256 = CryptoJS.HmacSHA256(hashkey, token).toString();
	var word = CryptoJS.enc.Utf8.parse(sha256);
	var auth = CryptoJS.enc.Base64.stringify(word);
	var author = 'Token token=\"' + token + '\",' + 'timestamp=\"' + timestamp + '\",auth=\"' + auth + '\"';
	var header = {
		Authorization: author
	};
	$.ajax({
		type: type,
		url: url,
		data: data,
		async: true,
		cache: false,
		headers: header,
		success: function(res) {
			if(res.errorCode == '200') {
				dtd.resolve(res)
			}
			//登录过期
			else if(res.errorCode == '405') {
				$('.xcConfirm').hide();
				var txt = '登录已过期2秒后，跳转到登录页面';
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
				setTimeout(function() {
					window.parent.location.href = window.location.origin;
				}, 2000);
			}
			//没权限
			else if(res.errorCode == '403') {
				dtd.reject();
				$('.xcConfirm').hide();
				var txt = res.message;
				window.wxc.xcConfirm(txt, 'confirm');
			} else {
				dtd.reject(res, data);
			}
		},
		error: function(res) {

			$(".xcConfirm").hide();
			var txt = '请检查网络或地址';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
			dtd.reject(res);
		}
	});
	return dtd.promise();
}
//设置cookie
function setCookie(cname, cvalue, exdays) {
	var exdays = exdays || 1;
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}
//获取cookie
function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

	if(arr = document.cookie.match(reg))

		return(arr[2]);
	else
		return null;
}
//清除cookie  
function clearCookie(name) {
	setCookie(name, "", -1);
}
//下载工具
window.downloadFile = function(sUrl) {
	var dtd = $.Deferred();
	//iOS devices do not support downloading. We have to inform user about this.
	if(/(iP)/g.test(navigator.userAgent)) {
		alert('Your device does not support files downloading. Please try again in desktop browser.');
		return false;
	}

	//If in Chrome or Safari - download via virtual link click
	if(window.downloadFile.isChrome || window.downloadFile.isSafari) {
		//Creating new link node.
		var link = document.createElement('a');
		link.href = sUrl;

		if(link.download !== undefined) {
			//Set HTML5 download attribute. This will prevent file from opening if supported.
			var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
			link.download = fileName;
		}

		//Dispatching click event.
		if(document.createEvent) {
			var e = document.createEvent('MouseEvents');
			e.initEvent('click', true, true);
			link.dispatchEvent(e);
			return true;
		}
	}

	// Force file download (whether supported by server).
	if(sUrl.indexOf('?') === -1) {
		sUrl += '?download';
	}

	window.open(sUrl, '_self');
	dtd.resolve();
	return true;
}

function backSlider(id, ind) {
	var liInd = ind || 0;
	var iframe = window.parent;
	var myiframe = iframe.document.getElementById('iframe');
	var _this = iframe.document.getElementById(id);
	var thisParent = $(_this).parent(); //slider
	var ishow = $(_this).children('ul');
	var iframeSrc = '';
	if(ishow.length == 0) {
		iframeSrc = $(_this).children('a').attr('iframsrc');
		var bgsrc = $(_this).children('span').attr('click-bgurl');
		$(_this).css('background', 'rgb(81, 151, 237)');
		thisParent.find('.active').removeClass('active');
		$(_this).addClass('active');
		$(_this).children('span').css('background-image', 'url(' + bgsrc + ')');
		$(_this).siblings().each(function(ind, ele) {
			var bgsrc = $(ele).children('span').attr('normal-bgurl');
			$(ele).children('span').css('background-image', 'url(' + bgsrc + ')');
			$(ele).children('ul').hide();
			$(ele).find('.shouwDown').hide();
			$(ele).css('background', '#4672a8');
		})
	} else {
		iframeSrc = $(_this).children('ul').find('li').eq(liInd).attr('iframsrc');
		var bgsrc = $(_this).children('span').attr('click-bgurl');
		var step1 = $(_this).index();
		thisParent.find('.active').removeClass('active');
		thisParent.find('li').css('background', '#4672a8');
		$(_this).children('ul').find('li').eq(liInd).css('background', '#5197ed');
		$(_this).children('ul').find('li').eq(liInd).addClass('active');
		$(_this).children('span').css('background-image', 'url(' + bgsrc + ')');
		$(_this).siblings().each(function(ind, ele) {
			var bgsrc = $(ele).children('span').attr('normal-bgurl');
			$(ele).children('span').css('background-image', 'url(' + bgsrc + ')');
			$(ele).children('ul').hide();
			$(ele).find('.shouwDown').hide();
		})
		$(_this).find('.shouwDown').show();
		$(_this).children('ul').show();
	}
	return false;
}
//检测是否有编辑权限

function checkEdit() {
	var edit = '';
	var view = '';
	var system = '';
	var admin = '';

	if(sessionStorage) {
		edit = sessionStorage.getItem('edit');
		system = sessionStorage.getItem('system');
		admin = sessionStorage.getItem('isAdmin');
	} else {
		edit = getCookie('edit');
		system = getCookie('system');
		admin = getCookie('admin');
	}
	if(!admin && !edit) {
		$('.isHasEdit').hide();
	}
	if(!admin && !system) {
		$('.isHasSystem').hide();
	}
}

function brower() {
	var broName = 'Runing';
	var str = '';
	var strStart = 0;
	var strStop = 0;
	var arr = new Array();
	var temp = '';
	var userAgent = window.navigator.userAgent; //包含以下属性中所有或一部分的字符串：appCodeName,appName,appVersion,language,platform
	if(userAgent.indexOf('Firefox') != -1) {
		isFireFox = true;
		/*broName = 'FireFox浏览器';*/
		strStart = userAgent.indexOf('Firefox');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'FireFox';
		return temp;
	}
	if(userAgent.indexOf("OPR") > -1) {
		strStart = userAgent.indexOf('OPR');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Opera';
		return temp;

	}
	if(userAgent.indexOf('Edge') != -1) {
		isEdge = true;
		/*broName = 'Edge浏览器';*/
		strStart = userAgent.indexOf('Edge');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Edge';
		return temp;
	}

	//Chrome浏览器
	if(userAgent.indexOf('Chrome') > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("OPR") < 0) {
		isChrome = true;
		/*broName = 'Chrome浏览器';*/
		var is360 = false;
		var option = 'type';
		var value = 'application/vnd.chromium.remoting-viewer';
		var mimeTypes = navigator.mimeTypes;

		for(var mt in mimeTypes) {
			if(mimeTypes[mt][option] == value) {
				is360 = true;
			}
		}
		strStart = userAgent.indexOf('Chrome');
		strStop = userAgent.indexOf(' Safari');
		temp = userAgent.substring(strStart, strStop);
		temp = temp.split('/');
		if(is360) {
			temp[0] = '360';
		} else {
			temp[0] = 'Chrome';
		}
		return temp;
	}

	//ie11以下
	if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
		var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
		reIE.test(userAgent);
		var fIEVersion = parseFloat(RegExp["$1"]);
		temp = ['IE', fIEVersion];
		return temp;
	}
	//ie11
	if(userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1) {
		temp = ['IE', 11];
		return temp;
	}
	if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1) {
		strStart = userAgent.indexOf('Safari');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Safari';
		return temp;
	}

}
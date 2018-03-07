$(function() {
	//检测是否登录
	var token = '';
	var isAdmin = ''
	if(sessionStorage) {
		token = sessionStorage.getItem("token");
		isAdmin = sessionStorage.getItem('isAdmin');
	} else {
		token = getCookie('token');
		isAdmin = getCookie('isAdmin');
	}
	if(!token) {
		window.location.href = 'font/login.html';
	}
	//页面刷新
	window.onbeforeunload = function() {
		var iframeSrc = $('#iframe').attr('src');
		console.log(iframeSrc)
		if(window.sessionStorage) {
			sessionStorage.setItem('iframe', iframeSrc);
		} else {
			setCookie('iframe', iframeSrc);
		}
	}
	var iframe = '';
	var step1 = '';
	var step2 = '';
	var username = '';
	if(sessionStorage) {
		iframe = sessionStorage.getItem('iframe')
		step1 = sessionStorage.getItem('step1');
		step2 = sessionStorage.getItem('step2');
		username = sessionStorage.getItem('username');
	} else {
		iframe = getCookie('iframe');
		step1 = getCookie('step1');
		step2 = getCookie('step2');
		username = getCookie('username');
	}
	console.log('地址' + iframe);
	$('.showusername').html(username);
	if(iframe) {
		$('#iframe').attr('src', iframe);
		var ele = $('.slider').children('li').eq(step1);
		var bgsrc = ele.children('span').attr('click-bgurl');
		ele.children('span').css('background-image', 'url(' + bgsrc + ')');
		if(step1 == '0') {
			ele.addClass('active');
		} else {
			ele.siblings().removeClass('active');
			ele.children('ul').show();
			ele.find('.shouwDown').show();
			ele.siblings().each(function(ind, ele) {
				var bgsrc = $(ele).children('span').attr('normal-bgurl');
				$(ele).children('span').css('background-image', 'url(' + bgsrc + ')');
			})
			if(step2) {
				ele.find('ul').find('li').eq(step2).addClass('active');
			} else {
				ele.addClass('active');

			}
		}
	}else{
		$('#iframe').attr('src','font/ftp.html');
	}
//	//浏览器点击返回
//	if(window.history && window.history.pushState) {　　
//		$(window).on('popstate', function() {　　
//			window.history.pushState('forward', null, '#');　　
//			window.history.forward(1);　　
//		});　　
//	}　　
//	window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
//	window.history.forward(1);
	//检测是否是超级管理员
	if(!isAdmin) {
		$('.adminShow').hide();
	}
	$('.showcountInfo').click(function() {
		var isshow = $('.showalert').css('display');
		if(isshow == 'none') {
			$('.showalert').show();
			$(this)[0].src = 'img/downClick.png';
			var now = new Date();
			var minute = now.getMinutes().toString();
			if(minute.length == 1) {
				minute = '0' + minute;
			}
			var htmlTime = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '&nbsp&nbsp' + now.getHours() + ':' + minute;
			$('.showtime').html(htmlTime);
		} else {
			$(this)[0].src = 'img/downnormal.png';
			$('.showalert').hide();
		}
		return false;
	})
	$('body').click(function() {
		$('.showalert').hide();
		return false;
	})
	//登出
	$('.logOut').click(function() {
		var url = '/api/v1/userLoginOut';
		myAjax(url, 'post').then(function(res) {
			if(sessionStorage) {
				sessionStorage.removeItem('iframe');
				sessionStorage.removeItem('step1');
				sessionStorage.removeItem('step2');
				sessionStorage.removeItem('isAdmin');
			} else {
				clearCookie('iframe');
				clearCookie('step1');
				clearCookie('step2');
				clearCookie('isAdmin');
			}
			var txt = '注销成功，欢迎再次登录';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
			setTimeout(function() {
				window.parent.location.href = window.location.origin;
			}, 2000)
		}, function(res) {
			console.log(res)
		})
	})
	$('#oldP').change(function() {
		var value = $(this).val();
		if(!value) {
			$('.errorold').html('不能为空');
		} else {
			$('.errorold').html('');
		}
	})
	$('#newP').change(function() {
		var value = $(this).val();
		if(!value) {
			$('.newpError').html('不能为空');
		} else {
			$('.newpError').html('');
		}
	})
	$('#newPt').on('input propertychange', function() {
		var pw = $('#newP').val(); //新密码
		var pwt = $(this).val(); //确认密码
		if(pw == pwt) {
			$('.newptError').html('');
		}
	})
	//修改密码
	$('.changePassword').click(function() {
		$('.changealert').show();
		$('.changealert input').val('');
		$('.changealert .error').html('');
	})
	$('.save').click(function() {
		var self = $(this);
		var oldp = $.trim($('#oldP').val());
		var newp = $.trim($('#newP').val());
		var newPt = $.trim($('#newPt').val());
		var username = $('.showusername').text();
		self.prop('disabled', true);
		if(!oldp) {
			self.prop('disabled', false);
			$('.errorold').html('原密码不能为空');
			return false;
		}
		if(!newp) {
			self.prop('disabled', false);
			$('.newpError').html('密码不能为空');
			return false;

		}
		if(getStrLen(newp) < 5) {
			self.prop('disabled', false);
			$('.newpError').html('密码最小长度5');
			return false;
		}
		if(getStrLen(newp) > 16) {
			self.prop('disabled', false);
			$('.newpError').html('密码最大长度16');
			return false;
		}
		if(!newPt) {
			self.prop('disabled', false);
			$('.newptError').html('确认密码不能为空');
			return false;
		}
		if(newp !== newPt) {
			self.prop('disabled', false);
			$('.newptError').html('两次密码不一致');
			return false;
		}

		oldp = CryptoJS.HmacSHA256(oldp, username).toString();
		newp = CryptoJS.HmacSHA256(newp, username).toString();
		var data = {
			oldPassword: oldp,
			newPassword: newp
		}
		var url = '/api/v1/updatePassword';
		myAjax(url, 'post', data).then(function(res) {
			$('.changealert').hide();
			self.prop('disabled', false);
			var txt = '密码修改成功，2秒后重新登录';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
			setTimeout(function() {
				window.parent.location.href = 'font/login.html';
			}, 2000)
		}, function(res) {
			self.prop('disabled', false);
			if(res.errorCode == '400') {
				$('.newpError').html('新密码与原密码一样');
			}
			if(res.errorCode == '401') {
				$('.errorold').html('原密码不正确');
			}

		})

	})
	$('.cancel').click(function() {
		$('.changealert').hide();
	})
	$('.slider').on('mouseenter','>li',function(){
		$(this).find('.shouwDown').show();
	})
	$('.slider').on('mouseleave','>li',function(){
		$(this).find('.shouwDown').hide();
	})
	$('.slider').on('click', '>li', function() {
		var ind = $(this).index();
		var self = $(this);
		var ifram = $('iframe');
		var iframSrc = '';
		var parentEle = self.parent();
		var ishow = self.children('ul').css('display');
		if(!ishow) {
			var bgsrc = self.children('span').attr('click-bgurl');
			iframeSrc = self.children('a').attr('iframSrc');
			parentEle.find('li').removeClass('active');
			self.addClass('active');
			ifram[0].src = iframeSrc;
			if(sessionStorage) {
				sessionStorage.setItem('iframe', iframeSrc);
				sessionStorage.setItem('step1', ind);
			} else {
				setCookie('step1', ind, 1);
				setCookie('iframe', iframeSrc);
			}
		}
		if(ishow == 'block') {
			var bgsrc = self.children('span').attr('normal-bgurl');
			parentEle.find('li').removeClass('active');
			self.children('ul').hide();
			self.find('.shouwDown').hide();
			self.children('span').css('background-image', 'url(' + bgsrc + ')');
		}
		if(ishow == 'none') {
			if(sessionStorage) {
				sessionStorage.setItem('step1', ind);
			} else {
				setCookie('step1', ind, 1);
			}
			var bgsrc = self.children('span').attr('click-bgurl');
			parentEle.find('.active').removeClass('active');
			parentEle.find('li').css('background', '#4672a8');
			self.css('background', '#5197ed');
			self.addClass('active');
			self.children('span').css('background-image', 'url(' + bgsrc + ')');
			self.find('.shouwDown').show();
			self.children('ul').show();
			$(this).siblings().each(function(ind, ele) {
				var bgsrc = $(ele).children('span').attr('normal-bgurl');
				$(ele).children('span').css('background-image', 'url(' + bgsrc + ')');
				$(ele).children('ul').hide();
				$(ele).find('.shouwDown').hide();
			})

		}
		return false;
	})
	$('.slider').on('click', '>li li', function() {
		var self = $(this);
		var iframSrc = self.attr('iframSrc');
		var ind = self.index();
		var ip = sessionStorage.getItem('ip');
		if(!ip){
			var txt = 'ip未设置，请先设置ip';
			window.wxc.xcConfirm(txt, "confirm");
			return false;
		}
		if(!self.hasClass('active')) {
			$('.slider li').css('background', '#4672a8');
			self.css('background', '#5197ed');
			$('.slider').find('.active').removeClass('active');
			self.addClass('active');
			$('iframe')[0].src = iframSrc;
			if(sessionStorage) {
				sessionStorage.setItem('iframe', iframSrc);
				sessionStorage.setItem('step2', ind);
			} else {
				setCookie('step2', ind, 1);
				sessionStorage.setCookie('iframe', iframSrc);
			}

		}
		return false;
	})

})

function myAjax(oldurl, type, data) {
	var dtd = $.Deferred();
	var type = type.toLocaleUpperCase();
	var url = window.localStorage["ip:port"] + oldurl;
	console.log(url);
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
			console.log(res);
			if(res.errorCode == '200') {
				dtd.resolve(res)
			} else if(res.errorCode == '405') {
				var txt = '登录已过期2秒后，跳转到登录页面';
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
				setTimeout(function() {
					window.parent.location.href = 'font/login.html';
				}, 2000);
			} else if(res.errorCode == '403') {
				dtd.reject();
				var txt = res.message;
				window.wxc.xcConfirm(txt, 'confirm');
			} else {
				dtd.reject(res);
			}
		},
		error: function(res) {
			//			window.parent.location.href = 'login.html';
			var txt = '请检查网络或地址';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
		}
	});
	return dtd.promise();
}
$(function() {
	jQuery.support.cors = true;
	//检测浏览器版本
	var browerResult = brower();
	var browerName = browerResult[0];
	var browerV = browerResult[1];
	if(isNaN(browerV)) {
		browerV = browerV.split('.')[0];
	}
	switch(browerName) {
		case 'IE':
			if(browerV < 10) {
				window.location.href = 'browerinfo.html';
			}
			if(browerV < 10) {
				$('.isShowPassword').hide();
			}
			break;
		case 'Chrome':
			if(browerV < 31) {
				window.location.href = 'browerinfo.html';
			}
		case 'Edge':
			if(browerV < 10) {
				window.location.href = 'browerinfo.html';
			}
			break;
		case 'FireFox':
			if(browerV < 47) {
				window.location.href = 'browerinfo.html';
			}
			break;
		case 'Opera':
			if(browerV < 39) {
				window.location.href = 'browerinfo.html';
			}
			break;
		case 'Safari':
			if(browerV < 10) {
				window.location.href = 'browerinfo.html';
			}
			break;

		default:
			break;
	}
	//清除admin
	if(sessionStorage) {
		sessionStorage.removeItem('iframe');
		sessionStorage.removeItem('step1');
		sessionStorage.removeItem('step2');
		sessionStorage.removeItem('isAdmin');
		sessionStorage.removeItem('isEdit');
		sessionStorage.removeItem('edit');
		sessionStorage.removeItem('system');
		sessionStorage.removeItem('ip');
	} else {
		clearCookie('isEdit');
		clearCookie('iframe');
		clearCookie('step1');
		clearCookie('step2');
		clearCookie('isAdmin');
		clearCookie('edit');
		clearCookie('system');
	}

	$('#username').focus(function() {
		$('.userimg')[0].src = '../img/user-input.png';
	})
	$('#username').blur(function() {
		$('.userimg')[0].src = '../img/username-normal.png';
	})
	$('#password').focus(function() {
		$('.passimg')[0].src = '../img/password-input.png';
	})
	$('#password').blur(function() {
		$('.passimg')[0].src = '../img/password-normal.png';
	})
	//检测用户是否记住密码
	var checkisPaw = '';
	if(localStorage) {
		checkisPaw = localStorage.getItem('isPassword');
	} else {
		checkisPaw = getCookie('isPassword');
	}
	if(checkisPaw) {
		$('#isRemer').prop('checked', true);
	}
	//是否明文显示密码
	$('.isShowPassword').click(function() {
		if($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this)[0].src = '../img/cansee.png';
			$('#password').prop('type', 'password');
		} else {
			$(this).addClass('active');
			$(this)[0].src = '../img/see.png';
			$('#password').prop('type', 'text');
		}
	})
	//重置
	$('.reset').click(function() {
		$('input').val('');
		$('.errorMessage').html('');
	})
	//登录
	$('.login').click(function() {
		var url = window.localStorage["ip:port"] + '/api/v1/userLogin';
		var name = $.trim($('#username').val());
		var password = $.trim($('#password').val());
		//判断是否记住密码
		if($('#isRemer').prop('checked')) {
			if(sessionStorage) {
				localStorage.setItem('isPassword', 'true');
				localStorage.setItem(name, password);
			} else {
				setCookie('isPassword', 'true', 1);
				setCookie(name, password, 1);
			}
		} else {
			if(sessionStorage) {
				localStorage.removeItem('isPassword', 'true');
				localStorage.removeItem(name, password);
			} else {
				clearCookie()('isPassword', 'true', 1);
				clearCookie(name, password, 1);
			}
		}
		//密码有账户同时存在
		if(name && password){
			password = CryptoJS.HmacSHA256(password, name).toString();	
		}else{
			$('.errorMessage').html('账户或密码不能为空');
			return false;
		}
		$('.errorMessage').html('');
		var data = {
			username: name,
			password: password,
			version: window.iptvVersion
		};

		var header = {};
		myAjax(url, 'post', header, data).then(function(res) {
			var admin = res.data.admin; //是否是超级管理员
			var versionState = res.data.versionState; //版本号
			var permissions = res.data.permissions; //拥有权限
			if(sessionStorage) {
				sessionStorage.setItem("token", res.data.token);
				sessionStorage.setItem('username', name);
				sessionStorage.setItem('versionState', versionState);
			} else {
				setCookie('username', name, 1);
				setCookie('token', res.data.token, 1);
				setCookie('versionState', versionState, 1);
			}
			if(admin) {
				if(sessionStorage) {
					sessionStorage.setItem('isAdmin', true);
				} else {
					setCookie('isAdmin', true);
				}
			}
			if(permissions) {
				for(var i = 0; i < permissions.length; i++) {
					var action = permissions[i].actionCode;
					if(sessionStorage) {
						sessionStorage.setItem(action, true);
					} else {
						setCookie(action, true);
					}
				}
			}
			window.location.href = '../iptvManager.html';
		}, function(res) {
			console.log(res)
			$('.errorMessage').html(res.message);
		})
	})
	//是否记住密码
	$('.iRemberLabel').click(function() {
		var ischecked = !$('#isRemer').prop('checked');
		var password = $('#password').val();
		var name = $('#username').val();
		if(ischecked) {
			if(sessionStorage) {
				localStorage.setItem('isPassword', 'true');
				localStorage.setItem(name, password);
			} else {
				setCookie('isPassword', 'true', 1);
				setCookie(name, password, 1);
			}
		} else {
			if(sessionStorage) {
				localStorage.removeItem('isPassword');
				localStorage.removeItem(name);
			} else {
				clearCookie('isPassword');
				clearCookie(name);
			}
		}
	})
	$('#username').change(function() {
		var name = $('#username').val();
		var password = '';
		if(sessionStorage) {
			password = localStorage.getItem(name);
		} else {
			password = getCookie(name);
		}
		if($('#isRemer').prop('checked')) {
			$('#password').val(password);
		}
	})
})

function myAjax(url, type, header, data) {
	var dtd = $.Deferred();
	$.ajax({
		type: type,
		url: url,
		data: data,
		async: true,
		timeout: 1000,
		success: function(res) {
			if(res.errorCode == '200') {
				dtd.resolve(res)
			} else {
				dtd.reject(res);
			}
		},
		error: function(res) {
			console.log(res)
			var txt = '请检查网络或地址';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
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
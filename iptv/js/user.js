var allUserName = '';
$(function() {
	//浏览器 后退恢复slider
	backSlider('user', 0);
	getAllUserPower();
	getUserGroup();
	getAllUser({
		limit: limit,
		offSet: 0
	});
	//模糊搜索
	$('#nameSearchInput').on('input propertychange', function() {
		var inputStr = $(this).val();
		var boxSearch = $('#nameUl');
		if(inputStr) {
			boxSearch.show();
			boxSearch.empty();
		}
		for(var i = 0; i < allUserName.length; i++) {
			var name = allUserName[i].userName;
			if(name.indexOf(inputStr) >= 0) {
				boxSearch.append("<li>" + name + "</li>");
			}

		}
	})
	$('#nameUl').on('click', 'li', function() {
		var name = $(this).text();
		$(this).parent().hide();
		$('#nameSearchInput').val(name);
	})
	$('.nameSearch').click(function() {
		$('#nameUl').hide();
		var name = $.trim($('#nameSearchInput').val());
		var data = {
			limit: limit,
			offSet: 0,
			userName: name
		}
		getAllUser(data);
	})
	$('#name').change(function() {
		var name = $(this).val();
		name = $.trim(name);
		if(!name) {
			$('.errorName').html('名称不能为空');
			return false;
		} else if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		} else if(getStrLen(name) > 32) {
			$('.errorName').html('名称不得多于16个汉字');
			return false;
		} else {
			$('.errorName').html('');
		}

	})
	$('#password').change(function() {
		var password = $(this).val();
		if(getStrLen(password) > 16) {
			$('.errorPa').html('密码最大长度为16');
		} else {
			$('.errorPa').html('');
		}

		$(this).addClass('change');
	})
	$('#trueName').change(function() {
		var trueName = $(this).val();
		if(!checkString(trueName)) {
			$('.trueNameError').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		} else if(getStrLen(trueName) > 16) {
			$('.trueNameError').html('名称不得多于8个汉字');
		} else {
			$('.trueNameError').html('');
		}
	})
	//搜索分组
	$('.showSearchSelect').click(function() {
		$('#classificationSelect').show();
		return false;
	})
	$('#classificationSelect').on('click', 'li', function() {
		var text = $(this).text();
		$('#classificationInput').val(text);
		$('#classificationSelect').hide();
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		var data = {
			limit: limit,
			offSet: 0,
		}
		getAllUser(data);
	})
	//隐藏弹框
	$('.cancle').click(function() {
		$('.alert').hide();
	})
	//选择分组
	$('.showGroupSelect').click(function() {
		$('#groupSelect').show();
		return false;
	})
	$('#groupSelect').on('click', 'li', function() {
		var name = $(this).text();
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(this).parent().hide();
		$('#group').val(name);
		$('.errorGroup').html('');
	})
	//增加用户
	$('.add_liveSource').click(function() {
		$('.alert .title').html('添加用户');
		$('#name').prop('readonly', false);
		$('.error').html("");
		$('.alert input').val('');
		$('.alert .save').addClass('saveAdd');
		$('.alert .save').removeClass('saveEmit');
		$('.alert').show();
	})
	$('.alert').on('click', '.saveAdd', function() {
		var url = '/api/v1/userEdit';
		var groupId = $('#groupSelect').find('.active').prop('value');
		var name = $('#name').val();
		name = $.trim(name);
		var password = $('#password').val();
		password = $.trim(password);
		var okpassword = $('#okPassword').val();
		okpassword = $.trim(okpassword);
		var trueName = $.trim($('#trueName').val());
		var remarks = $.trim($('#remarks').val());
		if(!name) {
			$('.errorName').html('名称不能为空');
			return false;
		}
		if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(name) > 32) {
			$('.errorName').html('名称不得多于16个汉字');
			return false;
		}
		if(!groupId) {
			$('.errorGroup').html('不能为空');
			return false;
		}
		if(!password) {
			$('.errorPa').html('密码不能为空');
			return false;
		}
		if(getStrLen(password) > 16) {
			$('.errorPa').html('密码最大长度为16');
			return false;
		}
		if(!okpassword) {
			$('.errorokPa').html('确认密码不能为空');
			return false;
		}
		if(password != okpassword) {
			$('.errorokPa').html('两次密码不一致');
			return false;
		}
		if(!checkString(trueName)) {
			$('.trueNameError').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(trueName) > 16) {
			$('.trueNameError').html('名称不得多于8个汉字');
		}
		if(getStrLen(remarks) > 32) {
			$('.remarksError').html('名称不得多于16个汉字');
		}

		password = CryptoJS.HmacSHA256(password, name).toString();
		var data = {
			roleId: groupId,
			userName: name,
			password: password,
			trueName: trueName,
			remark: remarks
		}
		console.log(data)
		myAjax(url, 'post', data).then(function(res) {
			$('.alert').hide();
			var txt = '增加成功';
			var nowpage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowpage - 1) * limit
			}
			getAllUser(data);
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			var errorCode = res.errorCode;
			if(errorCode == 400) {
				$('.remarksError').html(res.message);
			}
			if(errorCode == 402) {
				$('.errorName').html(res.message);
			}
			if(errorCode == 401) {
				$('.trueNameError').html(res.message);
			}
			console.log(res)
		})
	})
	//修改
	$('.ul_tbody').on('click', '.emit', function() {
		var userid = $(this).parent().attr('id');
		var url = '/api/v1/userEdit/' + userid;
		$('#name').prop('readonly', true);
		$('.alert .save').data('id', userid);
		$('.error').html('');
		$('.alert input').val('');
		$('.alert .save').removeClass('saveAdd');
		$('.alert .save').addClass('saveEmit');
		$('.alert .title').html('修改用户');
		$('.alert #password').removeClass('change');
		myAjax(url, 'get').then(function(res) {
			console.log(res)
			var groupid = res.data.roleId;
			var username = res.data.userName;
			var password = res.data.password;
			var trueName = res.data.trueName;
			var remark = res.data.remark;
			$('#trueName').val(trueName);
			$('#remarks').val(remark);
			$('#groupSelect li').each(function(ind, ele) {
				var value = $(ele).prop('value');
				var name = $(ele).text();
				if(value == groupid) {
					$(ele).addClass('active');
					$('#group').val(name);
				}
			})
			if(userid == 1) {
				$('#group').val('超级管理员无法修改');
				$('#groupSelect').hide();
			}
			$('#name').val(username);
			$('#password').data('pw', password);
			console.log('请求的密码' + password)
			$('#password').val('password');
			$('#okPassword').val('password');
			$('.alert').show();
		}, function(res) {
			console.log(res)
		})
	})
	$('.alert').on('click', '.saveEmit', function() {
		var id = $('.alert .save').data('id');
		var url = '/api/v1/userEdit/' + id;
		var groupId = $('#groupSelect').find('.active').val();
		var name = $('#name').val();
		name = $.trim(name);
		var password = '';
		var okpassword = '';
		var trueName = $.trim($('#trueName').val());
		var remarks = $.trim($('#remarks').val());

		if(!name) {
			$('.errorName').html('不能为空');
			return false;
		}
		if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(name) > 32) {
			$('.errorName').html('名称不得多于16个汉字');
			return false;
		}
		if(!groupId) {
			$('.errorGroup').html('不能为空');
			return false;
		}
		if($('#password').hasClass('change')) {
			password = $.trim($('#password').val());
			okpassword = $.trim($('#okPassword').val());
			if(!password) {
				$('.errorPa').html('不能为空');
				return false;
			}
			if(getStrLen(password) > 16) {
				$('.errorPa').html('密码最大长度为16');
				return false;
			}
			console.log('改了密码' + password);
			password = CryptoJS.HmacSHA256(password, name).toString();
		} else {
			password = '';
			console.log('没改密码' + password);
		}
		if(!checkString(trueName)) {
			$('.trueNameError').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(trueName) > 16) {
			$('.trueNameError').html('名称不得多于8个汉字');
		}
		if(getStrLen(remarks) > 32) {
			$('.remarksError').html('名称不得多于16个汉字');
		}
		var data = {
			roleId: groupId,
			userName: name,
			password: password,
			trueName: trueName,
			remark: remarks
		}
		console.log(data)
		myAjax(url, 'put', data).then(function(res) {
			$('.alert').hide();
			var txt = '修改成功';
			var username = $('#nameSearchInput').val();
			var nowpage = $('.nowPage').html();
			var data = {
				userName: username,
				limit: limit,
				offSet: (nowpage - 1) * limit
			}
			getAllUser(data);
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			console.log(res)
			var errorCode = res.errorCode;
			if(errorCode == 402) {
				$('.remarksError').html(res.message);
			}
			if(errorCode == 400) {
				$('.errorName').html(res.message);
			}
			if(errorCode == 401) {
				$('.trueNameError').html(res.message);
			}
		})

	})
	//删除
	$('.ul_tbody').on('click', '.dele', function() {
		var id = $(this).parent().attr('id');
		var url = '/api/v1/userEdit/' + id;
		var name = $(this).parent().prev().prev().html();
		var txt = '是否确认删除用户:' + name + '?';
		var username = $('#nameSearchInput').val();
		var option = {
			title: '删除',
			btn: parseInt('0011', 2),
			onOk: function() {
				myAjax(url, 'delete').then(function(res) {
					var nowPage = $('.nowPage').html();
					console.log(nowPage)
					var data = {
						limit: limit,
						offSet: (nowPage - 1) * limit,
						userName: username,
					}
					console.log(data);
					getAllUser(data);
					var txt = '删除成功';
					window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
				}, function(res) {
					var txt = res.message;
					window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
				})
			},
		}
		window.wxc.xcConfirm(txt, "warning", option);
	})
})
//排序
function sort(url, nowPage, type) {
	var type = type;
	myAjax(url, 'post', {
		type: type
	}).then(function(res) {
		var data = {
			limit: limit,
			offSet: (nowPage - 1) * limit
		}
		getUserGroup(data);
	}, function(res) {
		var txt = '';
		if(type == 'desc') {
			txt = '目前已是第一条'
		} else {
			txt = '目前已是最后一条'
		}
		window.wxc.xcConfirm(txt, 'confirm');
	})
}
//获取分类管理
function getUserGroup() {
	var url = '/api/v1/authRoles';
	myAjax(url, 'GET').then(function(res) {
		$.each(res.data.authRoles, function(ind, ele) {
			var id = ele.id;
			var name = ele.name;
			if(id != 1) {
				$('#groupSelect').append("<li value=" + id + " >" + name + "</li>");
			}
			$('#classificationSelect').append("<li  value=" + id + ">" + name + "</li>");
		});

	}, function(res) {

	})
}
//获取所有的用户
function getAllUser(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/userEdit';
	var groupId = $('#classificationSelect').find('.active').prop('value');
	var name = data.userName;
	data.roleId = groupId;
	myAjax(url, 'get', data).then(function(res) {
		console.log(res)
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			callBackPage(n, name)
		}, {
			pageCount: res.data.allPage, //总页码,默认10
			current: res.data.onPage, //当前页码,默认1
			showSumNum: false //是否显示总页码
		}, {

			"color": "#6d6d6d", //字体颜色
			"borderColor": "#d7d7d8", //边线颜色	
			"prevNextWidth": 36,
			"width": 550, //页码总宽度
			"height": 36, //页码总高度
			"pagesMargin": 10,
			"trunWidth": '' //跳转模块宽度
		});
	}, function(res, data) {
		var offSet = data.offSet;
		if(!data) {
			$('.loadingAlert').hide();
			return false;
		}
		if(offSet > 0) {
			data.offSet = offSet - 20;
			getAllUser(data);
		} else {
			$('.loadingAlert').hide();
			//初始化分页&自定义样式
			$('.page').createPage(function(n) {
				//切换页码的回调
			}, {
				pageCount: 1, //总页码,默认10
				current: 1, //当前页码,默认1
				showSumNum: false //是否显示总页码
			}, {

				"color": "#6d6d6d", //字体颜色
				"borderColor": "#d7d7d8", //边线颜色	
				"prevNextWidth": 36,
				"width": 550, //页码总宽度
				"height": 36, //页码总高度
				"pagesMargin": 10,
				"trunWidth": '' //跳转模块宽度
			});
			$('.ul_tbody').empty();
			$('.allPage').html('1'); //总页数
			$('.count').html('0'); //总条数
			$('.nowPage').html('1'); //当前页数
			var message = res.message;
			var tr = document.createElement('li');
			$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
			$('.ul_tbody').append(tr);
		}

	})
}

function callBackPage(ind, name) {
	var url = '/api/v1/userEdit';
	var groupId = $('#classificationSelect').find('.active').prop('value');
	var data = {
		userName: name,
		roleId: groupId,
		limit: limit,
		offSet: (ind - 1) * limit,
	};
	myAjax(url, 'get', data).then(function(res) {
		$('.loadingAlert').hide();
		var count = res.data.count;
		var nowPage = res.data.onPage;
		var allPage = res.data.allPage;
		var userInfo = res.data.userInfo;
		$('.count').html(count);
		$('.nowPage').html(nowPage);
		$('.allPage').html(allPage);
		$('.ul_tbody').empty();
		for(var i = 0; i < userInfo.length; i++) {
			var order = (res.data.onPage - 1) * limit + i + 1;
			var name = userInfo[i].userName;
			var id = userInfo[i].id;
			var roleName = userInfo[i].roleName;
			$('.ul_tbody').append("<li><span style='width: 7%;'>" + order + "</span>" +
				"<span style='width: 35%;'>" + name + "</span>" +
				"<span style='width: 42%;'>" + roleName + "</span>" +
				"<span id=" + id + " style='width: 16%;'> <img  title='编辑' class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'>  </span></li>");

		}

	}, function(res) {

	})
}
//获取所有的用户
function getAllUserPower() {
	var url = '/api/v1/readUser';
	myAjax(url, 'get').then(function(res) {
		console.log(res)
		var data = res.data
		allUserName = res.data;
	}, function(res) {
		console.log(res)

	})
}
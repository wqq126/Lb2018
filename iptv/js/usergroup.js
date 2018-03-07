$(function() {
	//浏览器 后退恢复slider
	backSlider('user',1);
	getAllGroup({
		limit: limit,
		offSet: 0
	});
	getAllPermissions();
	$('.pBox').on('click', 'label', function() {
		if($(this).hasClass('label')) {
			$(this).removeClass('label');
		} else {
			$(this).addClass('label');
		}
	})
	$('#name').change(function() {
		var name = $(this).val();
		name = $.trim(name);
		if(!name) {
			$('.errorName').html('不能为空');
			return false;
		} else if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		} else if(getStrLen(name) > 16) {
			$('.errorName').html('名称不得多于8个汉字');
			return false;
		} else {
			$('.errorName').html('');
		}
	})
	//隐藏弹框
	$('.cancle').click(function() {
		$('.alert').hide();
	})
	//增加用户
	$('.add_liveSource').click(function() {
		$('.alert .title').html('添加用户组');
		$('.error').html("");
		$('.alert input').val('');
		$('.alert .save').addClass('saveAdd');
		$('.alert .save').removeClass('saveEmit');
		$('.pBox label').removeClass('label');
		$('.alert').show();
	})
	$('.alert').on('click', '.saveAdd', function() {
		var name = $('#name').val();
		name = $.trim(name);
		var parr = ['view'];
		var data = {};
		var url = '/api/v1/authRoles';
		$('.pBox .label').each(function(ind, ele) {
			parr.push($(ele).attr('id'))
		})
		if(!name) {
			$('.errorName').html('名称不能为空');
			return false;
		} else if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		} else if(getStrLen(name) > 16) {
			$('.errorName').html('名称不得多于8个汉字');
			return false;
		}
		if(parr.length < 1) {
			$('.pError').html('请至少选择一个权限');
			return false;
		}
		parr = parr.join(',');
		data.name = name;
		data.permissions = parr;
		console.log(data)
		myAjax(url, 'post', data).then(function(res) {
			console.log(res)
			var txt = '增加成功';
			var nowpage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowpage - 1) * limit
			}
			$('.alert').hide();
			getAllGroup(data);
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			$('.errorName').html(res.message);
			console.log(res)
		})
	})
	//修改
	$('.ul_tbody').on('click', '.emit', function() {
		$('.error').html('');
		$('.alert input').val('');
		$('.pBox label').removeClass('label');
		$('.alert .save').removeClass('saveAdd');
		$('.alert .save').addClass('saveEmit');
		$('.alert .title').html('修改用户组');
		var id = $(this).parent().attr('id');
		var url = '/api/v1/authRoles/' + id;
		if(id==1){
			var txt = '超级管理员权限无法被修改';
			window.wxc.xcConfirm(txt,'confirm');
			return false;
		}
		$('.alert .save').data('id', id);
		myAjax(url, 'get').then(function(res) {
			console.log(res)
			var name = res.data.name;
			var checked = res.data.checked;
			$('#name').val(name)
			$('.pBox label').each(function(ind, ele) {
				var id = $(ele).attr('id');
				console.log(id);
				for(var i = 0; i < checked.length; i++) {
					var check = checked[i];
					if(check == id) {
						$(ele).addClass('label');
					}
				}
			})
			$('.alert').show();
		}, function(res) {
			$('.errorName').html(res.message);
			console.log(res)
		})
	})
	$('.alert').on('click', '.saveEmit', function() {
		var id = $('.alert .save').data('id');
		var url = '/api/v1/authRoles/' + id;
		var name = $('#name').val();
		name = $.trim(name);
		var parr = ['view'];
		var data = {};
		$('.pBox .label').each(function(ind, ele) {
			parr.push($(ele).attr('id'))
		})
		if(!name) {
			$('.errorName').html('名称不能为空');
			return false;
		}
		if(!checkString(name)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(name) > 16) {
			$('.errorName').html('名称不得多于8个汉字');
			return false;
		}
		if(parr.length < 1) {
			$('.pError').html('请至少选择一个权限');
			return false;
		}
		parr = parr.join(',');
		data.name = name;
		data.permissions = parr;
		console.log(data);
		myAjax(url, 'put', data).then(function(res) {
			console.log(res)
			var nowPage = $('.nowPage').html();
			var txt = '修改成功';
			console.log(nowPage)
			var data = {
				limit: limit,
				offSet: (nowPage - 1) * limit,
			}

			getAllGroup(data);
			$('.alert').hide();
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			console.log(res)
		})
	})
	//删除
	$('.ul_tbody').on('click', '.dele', function() {
		var id = $(this).parent().attr('id');
		var url = '/api/v1/authRoles/' + id;
		console.log(url);
		var name = $(this).parent().prev().prev().html();
		var txt = '是否确认删除用户组:' + name + '?';
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
					}
					console.log(data);
					getAllGroup(data);
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
//获取所有的用户权限
function getAllPermissions() {
	var url = '/api/v1/permissions';
	myAjax(url, 'get').then(function(res) {
		console.log(res)
		var edit = res.data.edit.name;
		var system = res.data.system.name;
		var view = res.data.view.name;
		$('.pBox').append("<div class='checkbox'><input type='checkbox'><label id='edit' for=''></label><span>" + edit + "</span></div>");
		$('.pBox').append("<div class='checkbox'><input type='checkbox'><label id='system' for=''></label><span>" + system + "</span></div>");
		//		$('.pBox').append("<div class='checkbox'><input type='checkbox'><label id='view' for=''></label><span>" + view + "</span></div>");
	})
}
//获取所有的用户分组
function getAllGroup(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/authRoles';
	myAjax(url, 'get', data).then(function(res) {
		console.log(res)
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			callBackPage(n)
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

	}, function(res) {
		console.log(res)

		var nowPage = $('.nowPage').html();
		if(nowPage - 1 > 0) {
			var data = {
				limit: limit,
				offSet: (nowPage - 2) * limit,
			}
			getAllGroup(data);
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

function callBackPage(ind) {
	var url = '/api/v1/authRoles';
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
	};
	myAjax(url, 'get', data).then(function(res) {
		$('.loadingAlert').hide();
		var data = res.data.authRoles;
		var count = res.data.count;
		var nowPage = res.data.onPage;
		var allPage = res.data.allPage;
		var userInfo = res.data.userInfo;
		$('.count').html(count);
		$('.nowPage').html(nowPage);
		$('.allPage').html(allPage);
		$('.ul_tbody').empty();
		for(var i = 0; i < data.length; i++) {
			var name = data[i].name;
			var id = data[i].id;
			var order = (res.data.onPage - 1) * limit + i + 1;
			var num = data[i].userNum;
			$('.ul_tbody').append("<li><span style='width: 7%;'>" + order + "</span><span style='width: 38.5%;'>" + name + "</span> <span style='width: 38.5%;'>" + num + "</span>  <span id=" + id + " style='width: 16%;'><img  title='编辑' class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> </span></li>")

		}

	}, function(res) {

	})
}
$(function() {
	//浏览器 后退恢复slider
	backSlider('channel', 4);
	//获取类型管理列表
	getAlltype({
		limit: limit,
		offSet: 0
	});
	//取消	
	$('.canclealert').click(function() {
		$('.alert').hide();
		$('.errorMessage').html('');
		$('.alert input').val('');
	})
	//显示增加弹出框
	$('.add').click(function() {

		$('.errorMessage').html('');
		$('.alert .save').removeClass('saveEmit');
		$('.alert').show().find('.save').addClass('saveAdd');
		$('.alert .title').html('增加');
	})
	//保存增加信息
	$('.alert').on('click', '.saveAdd', function() {
		var self = $(this);
		self.prop('disabled', true);
		addType(self);
	})
	//删除
	$('.ul_tbody').on('click', '.dele', function() {
		var type = $(this).parent().prev().prev().text();
		var id = $(this).parent().attr('id');
		var url = '/api/v1/types/' + id;
		var txt = '是否确认删除类型：' + type + '?';
		var option = {
			title: '删除',
			btn: parseInt('0011', 2),
			onOk: function() {
				myAjax(url, 'delete').then(function(res) {
					var nowPage = $('.nowPage').html();
					getAlltype({
						limit: limit,
						offSet: (nowPage - 1) * limit,
					})
					var txt = '删除成功';
					window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
				}, function(res) {
					var errorCode = res.errorCode;
					var txt = '此类型下存在节目，不能删除!';
					if(errorCode != 403) {
						window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
					}

				})
			},
			onCancle: function() {}
		}
		window.wxc.xcConfirm(txt, "warning", option);
	})
	//编辑分类
	$('.ul_tbody').on('click', '.emit', function() {
		$('.alert .title').html('编辑');
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.alert .title').html('查看');
			$('.alert input').prop('readonly', true);
			return false;
		}
		$('.alert .save').removeClass('saveAdd');
		var id = $(this).parent().attr('id');
		
		$('.alert').show().find('.save').addClass('saveEmit').data('id', id);
		$('#classificationName').val($(this).parent().parent().find('span').eq('1').text());

	})
	//保存编辑
	$('.alert').on('click', '.saveEmit', function() {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.alert').hide();
			return false;
		}
		var self = $(this);
		self.prop('disabled', true);
		var id = $(this).data('id');
		var url = '/api/v1/types/' + id;
		var name = $('#classificationName').val();
		name = $.trim(name);
		var nameArr = name.split(' ');
		if(nameArr.length != 1) {
			self.prop('disabled', false);
			$('.errorMessage').html('名称不能包含空格');
			return false;
		}
		if(!checkString(name)) {
			self.prop('disabled', false);
			$('.errorMessage').html('类型中含有非法字符，`~!@#$%^&*?');
			return false;
		}
		if(!checkString(name)) {
			self.prop('disabled', false);
			$('.errorMessage').html('类型中含有非法字符');
			return false;
		}
		if(!name) {
			self.prop('disabled', false);
			$('.errorMessage').html('类型不能为空');
			return false;
		}
		if(name.replace(/[^0-9]/ig, "")) {
			self.prop('disabled', false);
			$('.errorMessage').html('类型中不能包含数字');
			return false;
		}
		if(getStrLen(name) > 16) {
			self.prop('disabled', false);
			$('.errorMessage').html('类型最多输入8个汉字');
			return false;
		}
		var data = {
			name: name
		};
		emitClassification(url, data, self);

	})
	//升序
	$('.ul_tbody').on('click', '.desc', function() {

		var id = $(this).parent().attr('id');
		var url = '/api/v1/types/sort/' + id;
		var nowpage = $('.nowPage').html()
		sort(url, nowpage, 'desc');
	})
	//降序
	$('.ul_tbody').on('click', '.asc', function() {

		var id = $(this).parent().attr('id');
		var url = '/api/v1/types/sort/' + id;
		var nowpage = $('.nowPage').
		html()
		sort(url, nowpage, 'asc');
	})

})

//编辑分类
function emitClassification(url, data, self) {
	var self = self;
	myAjax(url, 'put', data).then(function(res) {
		self.prop('disabled', false);
		$('.alert').hide().find('#classificationName').val('');
		var data = {
			limit: limit,
			offSet: ($('.nowPage').html() - 1) * limit
		}
		getAlltype(data);
		var txt = '修改成功';
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
	}, function(res) {
		self.prop('disabled', false);
		$('.errorMessage').html(res.message);
	})
}

function addType(self) {
	var self = self;
	var url = '/api/v1/types';
	var name = $('#classificationName').val();
	name = $.trim(name);
	var nameArr = name.split(' ');
	if(nameArr.length != 1) {
		self.prop('disabled', false);
		$('.errorMessage').html('名称不能包含空格');
		return false;
	}
	if(!checkString(name)) {
		self.prop('disabled', false);
		$('.errorMessage').html('类型中含有非法字符，`~!@#$%^&*?');
		return false;
	}
	if(name.replace(/[^0-9]/ig, "")) {
		self.prop('disabled', false);
		$('.errorMessage').html('类型不能包含数字');
		return false;
	}
	if(!name) {
		self.prop('disabled', false);
		$('.errorMessage').html('不能为空');
		return false;
	}
	if(getStrLen(name) > 16) {
		self.prop('disabled', false);
		$('.errorMessage').html('最多输入8个汉字');
		return false;
	}
	var data = {
		name: name
	}

	myAjax(url, 'post', data).then(function(res) {
		self.prop('disabled', false);
		var nowPage = $('.nowPage').html();
		$('.alert').hide().find('#classificationName').val('');
		var txt = '添加成功';
		getAlltype({
			limit: limit,
			offSet: (nowPage - 1) * limit
		});
		$('.errorMessage').html('');
		$('.alert input').val('');
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
	}, function(res) {
		self.prop('disabled', false);
		$('.errorMessage').html(res.message);
	})
}

function getAlltype(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/types';
	myAjax(url, 'get', data).then(function(res) {
		var data = res.data;
		$('.ul_tbody').empty();
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
		var nowPage = $('.nowPage').html();
		if(nowPage - 1 > 0) {
			var data = {
				limit: limit,
				offSet: (nowPage - 2) * limit
			}
			getLiveSource(data)
		} else {
						//初始化分页&自定义样式
			$('.page').createPage(function(n) {
				//切换页码的回调
				callBackPage(n)
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
			$('.loadingAlert').hide();
			$('.ul_tbody').empty();
			$('.allPage').html('1'); //总页数
			$('.count').html('0'); //总条数
			$('.nowPage').html('1'); //当前页数
			var message = '未查询到数据';
			var tr = document.createElement('li');
			$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
			$('.ul_tbody').append(tr);
		}
	})
}

function callBackPage(ind) {
	var url = '/api/v1/types';
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
	}
	console.log(data);
	myAjax(url, 'get', data).then(function(res) {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		$('.loadingAlert').hide();
		var data = res.data;
		console.log(res)
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$('.ul_tbody').empty();
		$.each(res.data.type, function(ind, ele) {
			var showSrc = ''
			var showTitle = ''
			var show = ele.retired; //状态
			var showSrc = '../img/active-normal.png';
			if(show == 0) {
				//正常
				showSrc = '../img/active-normal.png';
				showTitle = '正常'
			} else if(show == 1) {
				//警告
				showSrc = '../img/active-notive.png';
				showTitle = '错误'
			}
			var order = (res.data.onPage - 1) * limit + ind + 1;
			if(edit) {
				var bodyHtml = "<li><span style='width: 22%;'>" + order + "</span>" +
					"<span style='width: 26%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'><img title=" + showTitle + " src=" + showSrc + "></span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img title='编辑' class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> <img title='升序' class='desc' src='../img/up-normal.png'> <img title='降序' class='asc' src='../img/down-normal.png'> </span>" +
					"</li>";
			} else {
				$('.main').css('height', '89%');
				var bodyHtml = "<li><span style='width: 22%;'>" + order + "</span>" +
					"<span style='width: 26%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'><img title=" + showTitle + " src=" + showSrc + "></span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img class='emit' src='../img/chakang.png'>  </span>" +
					"</li>";
			}

			$('.ul_tbody').append(bodyHtml);
		});
	}, function(res) {

	})
}
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
		getAlltype(data);
	}, function(res) {
		var txt = '';
		var errorCode = res.errorCode;
		if(type == 'desc') {
			txt = '目前已是第一条'
		} else {
			txt = '目前已是最后一条'
		}
		if(errorCode != 403) {
			window.wxc.xcConfirm(txt, 'confirm');
		}

	})
}
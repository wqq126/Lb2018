$(function() {
	//浏览器 后退恢复slider
	backSlider('channel', 3);
	//获取所有的分类
	getChannel({
		limit: limit,
		offSet: 0
	});
	//隐藏弹框
	$('.canclealert').click(function() {
		$('.alert').hide();
		$('.alert').find('input').val('');
	})
	//增加
	$('.add').click(function() {
		//检测是否有权限
		$('.alert .save').removeClass('saveEmit');
		$('.alert').show().find('.save').addClass('saveAdd');
		$('.alert .errorMessage').html('');
		$('.alert .title').html('增加');
	})
	$('.alert').on('click', '.saveAdd', function() {
		var self = $(this);
		self.prop('disabled', true);
		addClassification(self);
	})
	//删除
	$('.ul_tbody').on('click', '.dele', function() {

		var type = $(this).parent().prev().prev().text();
		var id = $(this).parent().attr('id');
		var url = '/api/v1/vodCategory/' + id;
		var txt = '是否确认删除分类:' + type + '?';
		var option = {
			title: '删除',
			btn: parseInt('0011', 2),
			onOk: function() {
				myAjax(url, 'delete').then(function(res) {
					var nowPage = $('.nowPage').html();
					getChannel({
						limit: limit,
						offSet: (nowPage - 1) * limit,
					})
					var txt = '删除成功';
					window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
				}, function(res) {
					var errorCode = res.errorCode;
					var txt = '此分类下存在节目，不能删除!';
					if(errorCode != 403) {
						window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
					}
				})
			},
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
			$('.alert input').prop('readonly', true);
			$('.alert .title').html('查看');
			return false;
		}
		var id = $(this).parent().attr('id');
		$('.alert .errorMessage').html('');
		$('.alert .save').removeClass('saveAdd');
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
		var url = '/api/v1/vodCategory/' + id;
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
			$('.errorMessage').html('分类中含有非法字符，`~!@#$%^&*?');
			return false;
		}
		if(!name) {
			self.prop('disabled', false);
			$('.errorMessage').html('分类不能为空');
			return false;
		}
		if(getStrLen(name) > 16) {
			self.prop('disabled', false);
			$('.errorMessage').html('分类最多输入8个汉字');
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
		sort('desc', id);
	})
	//降序
	$('.ul_tbody').on('click', '.asc', function() {

		var id = $(this).parent().attr('id');
		sort('asc', id);
	})
})

function sort(type, id) {
	var url = '/api/v1/vodCategory/sort/' + id;
	var type = type;
	myAjax(url, 'post', {
		type: type
	}).then(function(res) {
		var data = {
			limit: limit,
			offSet: ($('.nowPage').html() - 1) * limit
		}
		getChannel(data);
	}, function(res) {
		var errorCode = res.errorCode;
		var txt = '';
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
//获取分类
function getChannel(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/vodCategory';
	myAjax(url, 'get', data).then(function(res) {
		$('.ul_tbody').empty();
		$('.count').html(res.data.count);
		$('.nowPage').html(res.data.onPage);
		$('.allPage').html(res.data.allPage);
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			console.log(n);
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
			getChannel(data);
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
		getChannel(data);
		var txt = '修改成功';
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
	}, function(res) {
		self.prop('disabled', false);
		$('.errorMessage').html(res.message);
	})
}
//增加分类
function addClassification(self) {
	var self = self;
	var url = '/api/v1/vodCategory';
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
		$('.errorMessage').html('分类中含有非法字符，`~!@#$%^&*?');
		return false;
	}
	if(getStrLen(name) > 16) {
		self.prop('disabled', false);
		$('.errorMessage').html('分类最多输入8个汉字');
		return false;
	}
	if(name) {
		var data = {
			name: name
		}
		myAjax(url, 'post', data).then(function(res) {
			self.prop('disabled', false);
			$('.alert').hide().find('#classificationName').val('');
			var nowPage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowPage - 1) * limit
			};
			getChannel(data);
			var txt = '添加成功';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			self.prop('disabled', false);
			$('.errorMessage').html(res.message);
		})
	} else {
		self.prop('disabled', false);
		$('.errorMessage').html('分类不能为空');
	}
}

function callBackPage(ind) {
	var url = '/api/v1/vodCategory';
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
	}
	myAjax(url, 'get', data).then(function(res) {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		$('.loadingAlert').hide();
		var data = res.data;
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$('.ul_tbody').empty();
		$.each(res.data.category, function(ind, ele) {
			var order = (res.data.onPage - 1) * limit + ind + 1;
			if(edit) {
				var bodyHtml = "<li><span style='width: 22%;'>" + order + "</span>" +
					"<span style='width: 26%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'>" + ele.programNums + "</span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img title='编辑' class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> <img title='升序' class='desc' src='../img/up-normal.png'> <img title='降序' class='asc' src='../img/down-normal.png'> </span>" +
					"</li>";
			} else {
				$('.main').css('height', '89%');
				var bodyHtml = "<li><span style='width: 22%;'>" + order + "</span>" +
					"<span style='width: 26%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'>" + ele.programNums + "</span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img  class='emit' src='../img/chakang.png'>  </span>" +
					"</li>";
			}

			$('.ul_tbody').append(bodyHtml);
		})
	}, function(res) {
		
	})
}
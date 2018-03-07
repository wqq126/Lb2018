$(function() {
	//浏览器 后退恢复slider
	backSlider('live', 1);
	//获取所有的直播资源
	getLiveCategory({
		limit: limit,
		offSet: 0
	});
	//隐藏弹出框
	$('.canclealert').click(function() {
		$('.alert').hide();
		$('.alert').find('input').val('');
	})
	//增加分类
	$('.add').click(function() {

		$('.alert .save').removeClass('saveEmit');
		$('.errorMessage').html('');
		$('#classificationName').focus();
		$('.alert').show().find('.save').addClass('saveAdd');
		$('.alert .errorMessage').html('');
		$('.alert .title').html('增加');
	})
	$('.alert').on('click', '.saveAdd', function() {
		var self = $(this);
		self.prop('disabled', true);
		addClassification(self);
	})
	//编辑分类
	$('.ul_tbody').on('click', '.emit', function() {
		var edit = '';
		$('.alert .title').html('编辑');
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.alert input').prop('readonly',true);
			$('.alert .title').html('查看');
			return false;
		}
		$('.alert .save').removeClass('saveAdd');
		$('.alert .errorMessage').html('');
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
		var id = $(this).data('id');
		var url = '/api/v1/liveCategory/' + id;
		var name = $('#classificationName').val();
		var self = $(this);
		self.prop('disabled', true);
		name = $.trim(name);
		var nameArr = name.split(' ');
		if(nameArr.length != 1) {
			self.prop('disabled', false);
			$('.errorMessage').html('名称不能包含空格');
			return false;
		}
		if(!name) {
			self.prop('disabled', false);
			$('.errorMessage').html('分类不能为空');
			return false;
		}
		if(!checkString(name)) {
			self.prop('disabled', false);
			$('.errorMessage').html('分类中含有非法字符,`~!@#$%^&*+<>?')
			return false;
		}
		if(getStrLen(name) > 16) {
			self.prop('disabled', false);
			$('.errorMessage').html('分类最多输入8个汉字')
			return false;
		}
		var data = {
			name: name
		};
		emitClassification(url, data, self);
	})
	//删除
	$('.ul_tbody').on('click', '.dele', function() {

		var type = $(this).parent().prev().prev().text();
		var id = $(this).parent().attr('id');
		var url = '/api/v1/liveCategory/' + id;
		var txt = '是否确认删除分类:' + type + '?';
		var option = {
			title: '删除',
			btn: parseInt('0011', 2),
			onOk: function() {
				myAjax(url, 'delete').then(function(res) {
					var nowPage = $('.nowPage').html();
					getLiveCategory({
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
			}
		}
		window.wxc.xcConfirm(txt, "warning", option);
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
	var url = '/api/v1/liveCategory/sort/' + id;
	var type = type;
	myAjax(url, 'post', {
		type: type
	}).then(function() {
		getLiveCategory({
			limit: limit,
			offSet: ($('.nowPage').html() - 1) * limit
		});
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
//编辑分类
function emitClassification(url, data, self) {
	var self = self;
	myAjax(url, 'put', data).then(function(res) {
		var txt = '修改成功';
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		$('.alert').hide().find('#classificationName').val('');
		self.prop('disabled', false);
		var nowPage = $('.nowPage').html();
		getLiveCategory({
			limit: limit,
			offSet: (nowPage - 1) * limit
		});

	}, function(res) {
		self.prop('disabled', false);
		$('.errorMessage').html(res.message);
		console.log(res)
	})
}
//增加分类
function addClassification(self) {
	var self = self;
	var url = '/api/v1/liveCategory';
	var name = $('#classificationName').val();
	var nameArr = name.split(' ');

	name = $.trim(name);

	if(!name) {
		self.prop('disabled', false);
		$('.errorMessage').html('分类不能为空');
		return false;
	}
	if(nameArr.length != 1) {
		self.prop('disabled', false);
		$('.errorMessage').html('名称不能包含空格');
		return false;
	}
	if(!checkString(name)) {
		self.prop('disabled', false);
		$('.errorMessage').html('含有非法字符,`~!@#$%^&*()_+<>?');
		return false;
	}
	if(getStrLen(name) > 16) {
		self.prop('disabled', false);
		$('.errorMessage').html('分类最多输入8个汉字');
		return false;
	}
	var data = {
		name: name,

	}
	myAjax(url, 'post', data).then(function(res) {
		console.log(res)
		self.prop('disabled', false);
		$('.alert').hide().find('#classificationName').val('');
		var nowPage = $('.nowPage').html();
		getLiveCategory({
			limit: limit,
			offSet: (nowPage - 1) * limit,
		})
		var txt = '添加成功';
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
	}, function(res) {
		self.prop('disabled', false);
		$('.errorMessage').html(res.message);
		console.log(res)
	});
}

//获取直播资源分类管理
function getLiveCategory(data, url) {
	$('.loadingAlert').show();
	var url = '/api/v1/liveCategory';
	var data = data;
	myAjax(url, 'get', data).then(function(res) {
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
			getLiveCategory(data)
		} else {
			$('.loadingAlert').hide();
			$('.ul_tbody').empty();
			$('.count').html('0');
			$('.nowPage').html('1');
			$('.allPage').html('1');
			var message = res.message;
			var tr = document.createElement('li');
			$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
			$('.ul_tbody').append(tr);
		}
	})
}

function callBackPage(ind) {
	var url = '/api/v1/liveCategory';
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit
	}
	myAjax(url, 'get', data).then(function(res) {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		$('.ul_tbody').empty();
		$('.loadingAlert').hide();
		$('.count').html(res.data.count);
		$('.nowPage').html(res.data.onPage);
		$('.allPage').html(res.data.allPage);
		$.each(res.data.category, function(ind, ele) {
			var order = (res.data.onPage - 1) * limit + ind + 1;
			if(edit) {
				var bodyHtml = "<li><span style='width: 20%;'>" + order + "</span>" +
					"<span style='width: 28%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'>" + ele.channelNums + "</span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img title='编辑' class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> <img title='升序' class='desc' src='../img/up-normal.png'> <img title='降序' class='asc' src='../img/down-normal.png'> </span>" +
					"</li>";
			} else {
				$('.main').css('height', '89%');
				var bodyHtml = "<li><span style='width: 20%;'>" + order + "</span>" +
					"<span style='width: 28%;'>" + ele.name + "</span>" +
					"<span style='width: 26%;'>" + ele.channelNums + "</span>" +
					"<span style='width: 26%;' id=" + ele.id + "> <img  class='emit' src='../img/chakang.png'></span>" +
					"</li>";
			}

			$('.ul_tbody').append(bodyHtml);
		});
	}, function(res) {

	})

}
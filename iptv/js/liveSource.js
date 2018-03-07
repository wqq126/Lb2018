$(function() {
	//浏览器 后退恢复slider
	backSlider('live', 0);
	//鼠标悬停表格 title 提示
	$('.ul_tbody').on('mouseenter', 'span', function(e) {
		var self = $(e.target);
		self.prop('title', self.html());
	})
	//获取直播资源列表
	getLiveSource({
		limit: limit,
		offSet: 0
	});
	//获取所有的分类
	getLiveCategory();
	//视频预览
	$('.preview_video').click(function() {
		var videoSrc = $('#url').val();
		var videoObject = {
			container: '#video', //容器的ID或className
			variable: 'player', //播放函数名称
			loaded: 'loadedHandler', //当播放器加载后执行的函数
			autoplay: true, //是否自动播放
			live: true, //是否是直播
			wmode:'opaque',
			video: videoSrc
		}
		player = new ckplayer(videoObject);
	})
	//删除直播资源
	$('.ul_tbody').on('click', '.dele', function() {

		var id = $(this).parent().attr('id');
		var type = $(this).parent().prev().prev().prev().prev().text();
		deleLiveSource(id, type);
	})
	//编辑直播资源
	$('.ul_tbody').on('click', '.emit', function() {
		$('.alert .title').html('编辑直播资源');
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.alert input').prop('readonly',true);
			$('.alert .title').html('查看直播资源');
		}
		$('.save').addClass('saveEmit');
		$('.save').removeClass('saveAdd')
		var id = $(this).parent().attr('id');
		$('.save').data('id', id);
		
		$('.preview_btn').data('imgsrc', '');
		$('.error').html('')
		$('.imgBox').hide();
		$('#video').empty();
		getDetail(id);
	})
	$('#url').change(function(res) {
		$(this).addClass('change');
	})
	$('#input_imgsrc').change(function() {
		$(this).addClass('change');
	})
	//保存编辑
	$('.alert').on('click', '.saveEmit', function() {
		console.log('点击了')
		var self = $(this);
		self.prop('disabled', true);
		var channelSource = '';
		var channelInfo = '';
		var name = $.trim($('#name').val());
		var source = $('#url').val();
		var cateid = $('#groupSelect').find('.active').prop('value');
		console.log(cateid)
		var nameArr = name.split(' ');
		if(nameArr.length != 1) {
			self.prop('disabled', false);
			$('.errorName').html('名称不能包含空格');
			return false;
		}
		if(!cateid) {
			$('.errorGroup').html('请选择一个分类');
			self.prop('disabled', false);
			return false;
		}
		if(!name) {
			self.prop('disabled', false);
			$('.errorName').html('名称不能为空');
			return false;
		}
		if(!checkString(name)) {
			self.prop('disabled', false);
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		}
		if(getStrLen(name) > 32) {
			self.prop('disabled', false);
			$('.errorName').html('名称不得多于16个汉字');
			return false;
		}
		if(!source) {
			self.prop('disabled', false);
			$('.errorUrl').html('地址不能为空');
			return false;
		}
		if(CheckChinese(source)) {
			self.prop('disabled', false);
			$('.errorUrl').html('地址不能包含汉字');
			return false;
		}

		if($('#url').hasClass('change')) {
			var newSource = [];
			var oldSource = $('#url').data('channelSource')[0];
			oldSource.url = $('#url').val();
			newSource.push(oldSource);
			channelSource = newSource;
		} else {
			channelSource = $('#url').data('channelSource');
		}

		if($('.preview_btn').data('imgsrc')) {
			var base64 = $('.preview_btn').data('imgsrc');
			channelInfo = {
				"smallImg": base64
			};
		} else {
			channelInfo = $('#input_imgsrc').data('channelInfo');
		}
		channelSource = JSON.stringify(channelSource);
		channelInfo = JSON.stringify(channelInfo);

		var data = {
			channelName: $.trim($('#name').val()),
			categoryId: cateid,
			channelSource: channelSource,
			channelInfo: channelInfo
		};
		var url = '/api/v1/channels/' + $(this).data('id');
		myAjax(url, 'put', data).then(function(res) {
			$('.alert').hide();
			self.prop('disabled', false);
			var nowPage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowPage - 1) * limit,
			}
			getLiveSource(data);
			var txt = "修改成功";
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);

		}, function(res) {
			self.prop('disabled', false);
			if(res.errorCode == '402') {
				$('.errorUrl').html('地址不合法');
			}
			if(res.errorCode == '400') {
				$('.errorName').html('该直播频道已存在');
			}
		})

	})

	$('#name').change(function() {
		var channelName = $(this).val();
		channelName = $.trim(channelName);
		if(!channelName) {
			$('.errorName').html('不能为空');
			return false;
		} else if(getStrLen(channelName) > 32) {
			$('.errorName').html('最多输入16个汉字');
			return false;
		} else if(!checkString(channelName)) {
			$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
			return false;
		} else {
			$('.errorName').html('');
		}
	})
	$('#url').change(function() {
		var source = $(this).val();
		if(!source) {
			$('.errorUrl').html('不能为空');
			return false;
		} else if(CheckChinese(source)) {
			$('.errorUrl').html('不能包含汉字');
			return false;
		} else {
			$('.errorUrl').html('');
		}

	})
	$('.showGroupSelect').click(function(){
		$('#groupSelect').show();
		return false;
	})
	$('#groupSelect').on('click','li',function(){
		var text = $(this).text();
		var id = $(this).prop('value');
		$('#group').val(text);
		$('#group').data('id', id);
		$('.errorGroup').html('');
		$(this).parent().hide();
	})
	//添加直播资源
	$('.add_liveSource').click(function() {

		$('.alert .title').text('添加直播资源');
		$('.save').addClass('saveAdd');
		$('.save').removeClass('saveEmit');
		$('.error').html('');
		$('.errorUrl').html('');
		$('.preview_btn').data('imgsrc', '');
		$('.imgBox').hide();
		$('.alert').show();
		$('.alert input').val('');
		$('.preview_btn').data('imgsrc', '');
		$('#video').empty();
	})
	$('.alert').on('click', '.saveAdd', function() {
		var self = $(this);
		self.prop('disabled', true);
		console.log('点击了')
		addLiveSource(self);
	})
	$('.cancle').click(function() {
		$('.alert input').val('');
		$('.alert').hide();
		$('.alert .error').html('');
		$('#video').empty();
	})
	//图片上传
	$('#file_img').change(function() {
		var file = this.files[0];
		$('#input_imgsrc').val($(this).val());
		if(window.FileReader) {
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(e) {
				$('.preview_btn').data('imgsrc', e.target.result);
				$('#input_imgsrc').val(e.target.result);
				
			}
		}
	})
	//图片预览
	$('.preview_btn').click(function() {
		$('.imgBox').show();
		var src = $('#input_imgsrc').val();
		var img = new Image();
		img.src = src;
		img.onerror=function(){
			$('.imgBox').html('<img class="cancleImg" id="stopPre" src="../img/cancle.png?v=cf325ec93b" alt="" /><p>暂无图片</p>')
			
		}
		img.onload=function(){
			$('.imgBox').html("<img class='cancleImg' id='stopPre' src='../img/cancle.png?v=cf325ec93b' /> <img class='previewImg' src="+src+"></img>");
		}
	})
	$('.imgBox').on('click','.cancleImg',function() {
		$(this).parent().hide();

	})
	//搜索
	$('.showSearchSelect').click(function(){
		$('#classificationSelect').show();
		return false;
	})
	$('#classificationSelect').on('click','li',function(){
		var name = $(this).text();
		$('#classificationInput').val(name);
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(this).parent().hide();
		var data = {
			limit: limit,
			offSet: 0,
		}
		getLiveSource(data);
	})
	//升序
	$('.ul_tbody').on('click', '.desc', function() {

		var id = $(this).parent().attr('id');
		sort(id, 'desc');
	})
	//降序
	$('.ul_tbody').on('click', '.asc', function() {

		var id = $(this).parent().attr('id');
		sort(id, 'asc');
	})
})
//获取直播资源详情
function getDetail(id) {
	var url = '/api/v1/channels/' + id;
	myAjax(url, 'get').then(function(res) {
		var cateid = res.data.categoryId;
		$('#name').val(res.data.channelName);
		$('#group').val(res.data.categoryName);
		$('#group').data('id', res.data.categoryId);
		$('#groupSelect li').each(function(ind,ele){
			var id = $(ele).prop('value');
			if(id==cateid){
				$(ele).addClass('active');
			}
		})
		
		
		if(res.data.channelSource.length > 0) {
			$('#url').val(res.data.channelSource[0].url);
			$('#url').data('channelSource', res.data.channelSource);
		}
		if(res.data.channelInfo.smallImg != 'undefined') {
			$('#input_imgsrc').val(res.data.channelInfo.imgPreview);
		}
		$('#input_imgsrc').data('channelInfo', res.data.channelInfo);
		$('.alert').show();

	})
}

function loadedHandler() {
	player.addListener('error', errorHandler); //监听视频加载出错
}

function errorHandler(e) {
	console.log('error');
	//	changeText('.playerstate', '状态：视频加载错误，停止执行其它动作，等待其它操作');
}

//排序
function sort(id, type) {
	var categoryId = $('#classificationSelect').find('.active').prop('value');
	var url = '/api/v1/channels/sort/' + id;
	var type = type;
	var data = {
		type: type,
	};
	if(categoryId) {
		var txt = '分类时无法排序';
		window.wxc.xcConfirm(txt, 'confirm');
		return false;
	}
	myAjax(url, 'post', data).then(function(res) {
			var nowPage = parseInt($('.nowPage').html());
			getLiveSource({
				limit: limit,
				offSet: (nowPage - 1) * limit,
			});
		},
		function(res) {
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

		}
	)
}
//增加直播资源
function addLiveSource(self) {
	var self = self;
	var base64src = $('.preview_btn').data('imgsrc');
	var url = '/api/v1/channels';
	var channelName = $.trim($('#name').val());
	var categoryId = $('#group').data('id');
	var source = $.trim($('#url').val());
	var channelSource = '[{"name":"' + channelName + '","sort":1,"url":"' + source + '"}]';
	var channelInfo = '{"smallImg": "' + base64src + '"}';
	//检测名称
	var nameArr = name.split(' ');
	if(nameArr.length != 1) {
		self.prop('disabled', false);
		$('.errorName').html('名称不能包含空格');
		return false;
	}
	if(!channelName) {
		$('.errorName').html('名称不能为空');
		self.prop('disabled', false);
		return false;
	}
	if(getStrLen(channelName) > 32) {
		$('.errorName').html('名称最多输入16个汉字');
		self.prop('disabled', false);
		return false;
	}
	if(!checkString(channelName)) {
		self.prop('disabled', false);
		$('.errorName').html('名称中含有非法字符，`~!@#$%^&*()_+<>?');
		return false;
	}
	//检测分类	
	if(!$('#group').val()) {
		self.prop('disabled', false);
		$('.errorGroup').html('分类不能为空');
		return false;
	}
	//检测url
	if(!source) {
		self.prop('disabled', false);
		$('.errorUrl').html('地址不能为空');
		return false;
	}
	if(CheckChinese(source)) {
		self.prop('disabled', false);
		$('.errorUrl').html('地址中不能包含汉字');
		return false;
	}
	//	var Regip = /([0-9]{1,3}\.{1}){3}[0-9]{1,3}/;
	//	if(Regip.exec(source)) {
	//		var text = Regip.exec(source)[0];
	//		var ipisRight = !!text.match(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/);
	//		console.log(ipisRight)
	//		if(!ipisRight) {
	//			$('.errorUrl').html('地址ip非法');
	//			return false;
	//		}
	//	}
	var data = {
		channelName: channelName,
		categoryId: categoryId,
		channelSource: channelSource,
		channelInfo: channelInfo
	}
	console.log(data)
	myAjax(url, 'post', data).then(function(res) {
		$('.alert').hide();
		self.prop('disabled', false);
		var nowPage = $('.nowPage').html();
		var data = {
			limit: limit,
			offSet: (nowPage - 1) * limit,
		}
		getLiveSource(data);
		$('.alert').find('.error').html('');
		$('.alert').hide().find('input').val('');
		var txt = "添加成功";
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);

	}, function(res) {
		console.log(res)
		self.prop('disabled', false);
		var errorMessage = res.message;
		if(res.errorCode == '402') {
			$('.errorUrl').html('地址不合法');
		}
		if(res.errorCode == '400') {
			$('.errorName').html('该直播频道已存在');
		}

	})
}

//删除直播资源
function deleLiveSource(id, type) {
	//	categoryId: id
	var url = '/api/v1/channels/' + id;
	var txt = '是否确认删除直播:' + type + '?';
	var option = {
		title: '删除',
		btn: parseInt('0011', 2),
		onOk: function() {
			myAjax(url, 'delete').then(function(res) {
				var nowPage = $('.nowPage').html();
				getLiveSource({
					limit: limit,
					offSet: (nowPage - 1) * limit,
				})
				var txt = '删除成功';
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
			}, function(res) {
				var txt = res.message;
				window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
			})
		},
	}
	window.wxc.xcConfirm(txt, "warning", option);
}
//获取直播资源分类管理
function getLiveCategory() {
	var url = '/api/v1/liveCategory';
	myAjax(url, 'GET').then(function(res) {
		$.each(res.data.category, function(ind, ele) {
			var id = ele.id;
			var name = ele.name;
			$('#groupSelect').append("<li value=" + id + " >" + name + "</li>");
			$('#classificationSelect').append("<li  value=" + id + ">" + name + "</li>");
		});

	}, function(res) {})
}
//获取直播资源列表
function getLiveSource(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/channels';
	var id = $('#classificationSelect').find('.active').prop('value');
	data.categoryId = id;
	console.log(data)
	myAjax(url, 'get', data).then(function(res) {
		console.log(res)
		var data = res.data;
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			cakkBackPage(n);
		}, {
			pageCount: data.allPage, //总页码,默认10
			current: data.onPage, //当前页码,默认1
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
		console.log(data)
		if(!data) {
			$('.loadingAlert').hide();
			return false;
		}
		var offSet = data.offSet;
		var id = $('#classificationSelect').find('.active').prop('value');
		if(offSet > 0) {
			var data = {
				limit: limit,
				offSet: offSet - 20,
				categoryId: id
			}
			getLiveSource(data);
		} else {
			console.log('error');
			$('.loadingAlert').hide();
			$('.ul_tbody').empty();
			$('.allPage').html('1'); //总页数
			$('.count').html('0'); //总条数
			$('.nowPage').html('1'); //当前页数
			var message = res.message;
			var tr = document.createElement('li');
			$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
			$('.ul_tbody').append(tr);
			$('.page').createPage(function(n) {
				//切换页码的回调
				//				cakkBackPage(n);
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
		}

	})
}

function cakkBackPage(ind) {
	var url = '/api/v1/channels';
	var id = $('#classificationSelect').find('.active').prop('value');
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
		categoryId: id
	};
	myAjax(url, 'get', data).then(function(res) {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		$('.loadingAlert').hide();
		$('.ul_tbody').empty();
		var data = res.data;
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$.each(data.channel, function(ind, ele) {
			var categoryName = ele.categoryName //分组
			var channelName = ele.channelName //名称
			if(ele.channelSource.length > 0) {
				var sourceUrl = ele.channelSource[0].url;
			}
			var show = ele.retired; //状态
			var showTitle = ''
			var showSrc = '../img/active-normal.png';
			if(show == 0) {
				//正常
				showTitle = '正常';
				showSrc = '../img/active-normal.png';
			} else if(show == 1) {
				//警告
				showSrc = '../img/active-notive.png';
			} else if(show == 2) {
				//错误
				showTitle = '错误';
				showSrc = '../img/active-error.png';
			}
			var tr = document.createElement('li');
			$(tr).data('channelSource', ele.channelSource);
			var order = (data.onPage - 1) * limit + ind + 1;
			if(edit) {
				$(tr).append("<span style='width: 7%;'>" + order + "</span>")
					.append("<span style='width: 17%;'>" + channelName + "</span>")
					.append("<span style='width: 17%;'>" + categoryName + "</span>")
					.append("<span style='width: 34%;'>" + sourceUrl + "</span>")
					.append("<span style='width: 7%;'><img title=" + showTitle + " src=" + showSrc + "></span>")
					.append("<span style='width: 18%;' id=" + ele.id + "> <img  title='编辑' categoryId=" + ele.categoryId + " class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> <img title='升序' class='desc' src='../img/up-normal.png'> <img class='asc' title='降序' src='../img/down-normal.png'> </span>");
			} else {
					$(tr).append("<span style='width: 7%;'>" + order + "</span>")
					.append("<span style='width: 17%;'>" + channelName + "</span>")
					.append("<span style='width: 17%;'>" + categoryName + "</span>")
					.append("<span style='width: 34%;'>" + sourceUrl + "</span>")
					.append("<span style='width: 7%;'><img title=" + showTitle + " src=" + showSrc + "></span>")
					.append("<span style='width: 18%;' id=" + ele.id + "> <img  title='查看' categoryId=" + ele.categoryId + " class='emit' src='../img/chakan.png'></span>");
			}
			$('.ul_tbody').append(tr);
		});
	}, function() {

	})

}
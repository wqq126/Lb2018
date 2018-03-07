var idArr = [];
var typeArr = [];
$(function() {
	//浏览器 后退恢复slider
	backSlider('channel', 1);
	getManagerSource({
		limit: limit,
		offSet: 0
	});
	getChannel();
	getAlltype();
	$('.scanningAlert .URLList').on('mouseenter', '.url', function(e) {
		var self = $(e.target);
		self.prop('title', self.text());
	})
	$('.mangerList').on('mouseenter', '.showtitle', function() {
		$(this).prop('title', $(this).text());
	})
	//跳转到转码列表
	$('.ul_tbody').on('click','.jumpTrancList',function(){
		var trancParent = window.parent.document.getElementById('channel');
		var trancEle = $(trancParent).find('ul').find('li').eq(2);
		$(trancEle).trigger('click');
		return false;
	})
	//视频预览
	$('.scanningAlert').on('click', '.prevVideo', function() {
		var videoSrc = $(this).parent().parent().find('span').eq(1).text();
		var videoObject = {
			container: '#video', //容器的ID或className
			variable: 'player', //播放函数名称
			autoplay: true, //是否自动播放
			duration: 0, //设置视频总时间
			debug: false, //是否开启调试模式,
			config: '',
			drag: 'start', //拖动的属性
			seek: 0, //默认跳转的时间
			live:false,//是否是直播视频，true=直播，false=点播
			allowFullScreen: true,
			flashplayer: true, //强制使用flashplayer
			video: videoSrc
		}
		player = new ckplayer(videoObject);
		$('#video').append("<div class='pretitle' >视频预览</div>");
		$(this).prop('src', '../img/videopause.png');
		$(this).parent().parent().siblings().each(function(ind, ele) {
			$(ele).find('span').eq('3').find('img').prop('src', '../img/videoPlay.png');
		})
		return false;
	})
	$('.scanningAlert_typebox').on('click', '.mylabel', function() {
		idArr = [];
		typeArr = [];
		if($(this).hasClass('label')) {
			$(this).removeClass('label');
		} else {
			$(this).addClass('label');
		}
		$('.scanningAlert_typebox').find('.label').each(function(ind, ele) {
			var id = $(ele).attr('id');
			var type = $(ele).parent().text();
			if(idArr.indexOf(id) < 0) {
				idArr.push(id);
			}
			if(typeArr.indexOf(type < 0)) {
				typeArr.push(type);
			}

		})
		$('#scanningAlertTypeInput').val(typeArr.join(','));
		return false;
	})
	$('.showscanningAlert_typebox').click(function(event) {
		event.stopPropagation();
		var isShow = $('.scanningAlert_typebox').css('display');
		if(isShow == 'none') {
			$('.scanningAlert_typebox').show();
		} else {
			$('.scanningAlert_typebox').hide();
		}

	})

	//删除直播资源
	$('.mangerList').on('click', '.dele', function() {
		var id = $(this).parent().attr('id');
		var type = $(this).parent().prev().prev().prev().prev().text();
		deleLiveSource(id, type);
	})
	//编辑直播资源
	$('.mangerList').on('click', '.emit', function() {
		$('.scanningAlert .title').text('编辑点播资源');
		var isTranc = $(this).parent().parent().find('.jumpTrancList');
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.scanningAlert input').prop('readonly', true);
			$('.scanningAlert textarea').prop('readonly', true);
			$('.scanningAlert .title').text('查看点播资源');
		}
		if(isTranc.length>0){
			var txt = "视频正在转码，无法修改";
			window.wxc.xcConfirm(txt, 'confirm');
			return false;
		}
		var id = $(this).parent().attr('id');
		$('.save').data('id', id);
		$('.preview_btn').data('imgsrc', '');
		$('textarea').val('');
		$('.scanningAlert').val('');
		$('.scanningAlert .error').html('');
		$('.scanningAlertImgBox').hide();
		getDetail(id);
	})
	$('.scanningAlert').on('click', '.save', function() {
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			$('.scanningAlert').hide();
			return false;
		}
		var self = $(this);
		self.prop('disabled', true);
		var name = $('#scanningAlert_name').val();
		name = $.trim(name);
		var directorie = $('#scanningAlertDire').val();
		directorie = $.trim(directorie);
		var year = $('#scanningAlertYear').val();
		year = $.trim(year);
		var area = $('#scanningAlertArea').val();
		area = $.trim(area);
		var cast = $('#scanningAlertCast').val();
		cast = $.trim(cast);
		var introduct = $('#scanningAlertInfo').val();
		introduct = $.trim(introduct);
		var cateid = $('#scanningAlertChannel').find('.active').prop('value');
		var base64src = $('.scanningAlertpreImg').data('imgsrc') || $('.scanningAlertpreImg').data('smallimg');
		var oldprogramPlayList = $('.save').data('source');
		var sourSpan = $('.URLList li');
		for(var i = 0; i < oldprogramPlayList.length; i++) {
			var oldname = oldprogramPlayList[i].name;
			for(var j = 0; j < sourSpan.length; j++) {
				var id = $(sourSpan[j]).find('span').eq(2).attr('id');
				var sort = $(sourSpan[j]).find('span').eq(2).attr('sort');
				if(id == oldname) {
					oldprogramPlayList[i].sort = sort;
				}
			}
		}
		var programInfo = {
			"year": year,
			"area": area,
			"cast": cast,
			"smallImg": base64src,
			"introduct": introduct,
			"director": directorie
		}
		programInfo = JSON.stringify(programInfo);
		programPlayList = JSON.stringify(oldprogramPlayList);
		var data = {
			programName: name,
			categoryId: cateid,
			programPlayList: programPlayList,
			programInfo: programInfo,
			type: idArr.join(',')
		};
		//检测名字长度
		if(!name) {
			self.prop('disabled', false);
			$('.errorName').html('不能为空');
			return false;
		}
		if(getStrLen(name) > 32) {
			self.prop('disabled', false);
			$('.errorName').html('最多输入16个汉字');
			return false;
		}
		if(!checkString(name)) {
			self.prop('disabled', false);
			$('.errorName').html('含有非法字符');
			return false;
		}
		//检测年代输入
		if(isNaN(year)) {
			self.prop('disabled', false);
			$('.errorYear').html('只能输入数字');
			return false;
		}
		if(year) {
			if(year < 1894 || year > new Date().getFullYear()) {
				self.prop('disabled', false);
				$('.errorYear').html('请输入正确的年份');
				return false;
			}
		}
		if(!$('#scanningAlertTypeInput').val()) {
			self.prop('disabled', false);
			$('.errorType').html('不能为空');
			return false;
		}
		//检测导演输入
		if(getStrLen(directorie) > 20) {
			self.prop('disabled', false);
			$('.errorDirectories').html('最多输入10个汉字');
			return false;
		}
		if(directorie.replace(/[^0-9]/ig, "")) {
			self.prop('disabled', false);
			$('.errorDirectories').html('名字不能包含数字');
			return false;
		}
		if(!checkString(directorie)) {
			self.prop('disabled', false);
			$('.errorDirectories').html('含有非法字符');
			return false;
		}
		//检测地区输入
		if(getStrLen(area) > 20) {
			self.prop('disabled', false);
			$('.errorArea').html('最多输入10个汉字');
			return false;
		}
		if(area.replace(/[^0-9]/ig, "")) {
			self.prop('disabled', false);
			$('.errorArea').html('地区不能包含数字');
			return false;
		}
		if(!checkString(area)) {
			self.prop('disabled', false);
			$('.errorArea').html('含有非法字符');
			return false;
		}
		//检测演员输入
		if(getStrLen(cast) > 30) {
			self.prop('disabled', false);
			$('.errorCast').html('最多输入15个汉字');
			return false;
		}
		if(cast.replace(/[^0-9]/ig, "")) {
			self.prop('disabled', false);
			$('.errorCast').html('名字不能包含数字');
			return false;
		}
		if(!checkString(cast)) {
			self.prop('disabled', false);
			$('.errorCast').html('含有非法字符');
			return false;
		}
		//检测简介
		if(!checkString(introduct)) {
			self.prop('disabled', false);
			$('.errorIntroduct').html('含有非法字符');
			return false;
		}
		if(getStrLen(introduct) > 100) {
			$('.errorIntroduct').html('最多输入50个汉字');
			self.prop('disabled', false);
			return false;
		}
		var url = '/api/v1/programs/' + $(this).data('id');
		myAjax(url, 'put', data).then(function(res) {
			self.prop('disabled', false);
			$('#video').empty();
			var nowPage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowPage - 1) * limit
			}
			getManagerSource(data);
			$('.scanningAlert').hide();
			var txt = "修改成功";
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
		}, function(res) {
			self.prop('disabled', false);
			$('.errorName').html(res.message)
		})

	})
	$('.cancle').click(function() {
		typeArr = [];
		idArr = [];
		$('.scanningAlert input').val('');
		$('.scanningAlert textarea').val('');
		$('.scanningAlert label').removeClass('label');
		$('.scanningAlert').hide();
		$('#video').empty();

	})
	//选择分类
	$('.showscanningAlertChannel').click(function() {
		$('#scanningAlertChannel').show();
		return false;

	})
	$('#scanningAlertChannel').on('click', 'li', function() {
		var text = $(this).text();
		$('#scanningAlertInput').val(text);
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	})

	//图片上传
	$('#scanningAlertFileImg').change(function() {
		var file = this.files[0];
		if(window.FileReader) {
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(e) {
				$('.scanningAlertpreImg').data('imgsrc', e.target.result)
				$('#scanningAlertInputImg').val(e.target.result);
			}
		}
	})
	//图片预览
	$('.scanningAlertpreImg').click(function() {
		$('.scanningAlertImgBox').show();
		var src = $('#scanningAlertInputImg').val();
		var img = new Image();
		$(img).addClass('preImg');
		img.src = src;
		img.onload = function() {
			$('.scanningAlertImgBox').html("<img src='../img/cancle.png' class='cancelImg' /> <img class='preImg' src=" + src + " />");
		}
		img.onerror = function() {
			$('.scanningAlertImgBox').html("<img src='../img/cancle.png' class='cancelImg' /> <p>暂无图片</p>");

		}

	})
	$('.scanningAlert').on('click', '.cancelImg', function() {
		$(this).parent().hide();
	})
	//播放列表降序
	$('.scanningAlert').on('click', '.sourceDown', function() {
		var self = $(this).parent().parent();
		var next = $(this).parent().parent().next();
		var selesort = self.find('span').eq(2).attr('sort');
		var nextsort = next.find('span').eq(2).attr('sort');
		if(next.length > 0) {
			next.after(self);
			next.find('span').eq(2).attr('sort', selesort);
			self.find('span').eq(2).attr('sort', nextsort);
		} else {
			var txt = '目前已是最后一条';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.confirm);
		}
		$('.URLList li').each(function(ind, ele) {
			$(ele).find('span').eq(0).html(ind + 1);
		})
	})
	//播放列表升序
	$('.scanningAlert').on('click', '.sourceUP', function() {
		var self = $(this).parent().parent();
		var selesort = self.find('span').eq(2).attr('sort');
		var prev = $(this).parent().parent().prev();
		var prevsort = prev.find('span').eq(2).attr('sort');
		if(prev.length > 0) {
			self.after(prev);
			prev.find('span').eq(2).attr('sort', selesort);
			self.find('span').eq(2).attr('sort', prevsort);
		} else {
			var txt = '目前已是第一条';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.confirm);
		}
		$('.URLList li').each(function(ind, ele) {
			$(ele).find('span').eq(0).html(ind + 1);
		})
	})
	//升序
	$('.mangerList').on('click', '.desc', function() {

		var id = $(this).parent().attr('id');
		sort(id, 'desc');
	})
	//降序
	$('.mangerList').on('click', '.asc', function() {

		var id = $(this).parent().attr('id');
		sort(id, 'asc');
	})
	//分类搜索
	$('.showclassificationSelect').click(function() {
		$('#classificationSelect').show();
		return false;
	})
	$('#classificationSelect').on('click', 'li', function() {
		var name = $(this).text();
		$('#classificationInput').val(name);
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(this).parent().hide();
		var data = {
			limit: limit,
			offSet: 0,
		};
		getManagerSource(data);
	})

	//类型搜索
	$('.showtypeSelect').click(function() {
		$('#typeSelect').show();
		return false;
	})
	$('#typeSelect').on('click', 'li', function() {
		var text = $(this).text();
		$('#typeInput').val(text);
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(this).parent().hide();
		var data = {
			limit: limit,
			offSet: 0
		};
		getManagerSource(data)
	})
	$('#scanningAlert_name').change(function() {
		var name = $(this).val();
		name = $.trim(name);
		if(!name) {
			$('.errorName').html('不能为空');
		} else if(getStrLen(name) > 32) {
			$('.errorName').html('最多输入16个汉字');
		} else if(!checkString(name)) {
			$('.errorName').html('含有非法字符');
		} else {
			$('.errorName').html('');
		}
	})

	$('#scanningAlertDire').change(function() {
		var val = $(this).val();
		val = $.trim(val);
		if(getStrLen(val) > 20) {
			$('.errorDirectories').html('最多输入10个汉字');
			return false;
		} else if(val.replace(/[^0-9]/ig, "")) {
			$('.errorDirectories').html('名字不能包含数字');
			return false;
		} else if(!checkString(val)) {
			$('.errorDirectories').html('含有非法字符');
		} else {
			$('.errorDirectories').html('');
		}
	})
	$('#scanningAlertYear').change(function() {
		var year = $(this).val();
		year = $.trim(year);
		if(year) {
			if(isNaN(year)) {
				$('.errorYear').html('只能输入数字');
			} else if(year < 1894 || year > new Date().getFullYear()) {
				$('.errorYear').html('请输入正确的年份');
			} else {
				$('.errorYear').html('');
			}
		} else {
			$('.errorYear').html('');
		}
	})
	$('#scanningAlertArea').change(function() {
		var area = $(this).val();
		area = $.trim(area);
		if(getStrLen(area) > 20) {
			$('.errorArea').html('最多输入10个汉字');
			return false;
		} else if(area.replace(/[^0-9]/ig, "")) {
			$('.errorArea').html('地区不能包含数字');
			return false;
		} else if(!checkString(area)) {
			$('.errorArea').html('含有非法字符');
		} else {
			$('.errorArea').html('');
		}
	})
	$('#scanningAlertCast').change(function() {
		var cast = $(this).val();
		cast = $.trim(cast);
		if(getStrLen(cast) > 30) {
			$('.errorCast').html('最多输入15个汉字');
			return false;
		} else if(cast.replace(/[^0-9]/ig, "")) {
			$('.errorCast').html('名字不能包含数字');
			return false;
		} else if(!checkString(cast)) {
			$('.errorCast').html('含有非法字符');
		} else {
			$('.errorCast').html('');
		}
	})
	$('scanningAlertInfo').change(function() {
		var introduct = $(this).val();
		introduct = $.trim(introduct);
		if(getStrLen(introduct) > 100) {
			$('.errorIntroduct').html('最多输入50个汉字');
			return false;
		} else if(!checkString(introduct)) {
			$('.errorIntroduct').html('含有非法字符');
		} else {
			$('.errorIntroduct').html('');
		}
	})

})

//获取所有的类型
function getAlltype() {
	var url = '/api/v1/types';
	myAjax(url, 'get').then(function(res) {
		$.each(res.data.type, function(ind, ele) {
			$('.scanningAlert_typebox').append("<span style='text-overflow:ellipsis;'><input id='isRemer' type='checkbox'><label id=" + ele.id + " class=' mylabel'></label> <span>" + ele.name + "</span>  </span>")
			$('#typeSelect').append('<li value=' + ele.id + '>' + ele.name + '</li>');
		});
	}, function(res) {
		console.log(res)
	})
}
//删除直播资源
function deleLiveSource(id, type) {
	var url = '/api/v1/programs/' + id;
	var txt = '是否确认删除点播:' + type + '?';
	var option = {
		title: '删除',
		btn: parseInt('0011', 2),
		onOk: function() {
			myAjax(url, 'delete').then(function(res) {
				var nowPage = $('.nowPage').html();
				getManagerSource({
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
		onCancle: function() {
			alert('ss')
		}
	}
	window.wxc.xcConfirm(txt, "warning", option);
}
//排序
function sort(id, type) {
	var tyoe = type;
	var url = '/api/v1/programs/sort/' + id;
	var typeid = $('#typeSelect').find('.active').prop('value');
	var categoryId = $('#classificationSelect').find('.active').prop('value');
	var data = {
		type: type,
		categoryId: categoryId,
	};
	if(typeid) {
		var txt = '类型搜索时无法排序';
		window.wxc.xcConfirm(txt, 'confirm');
		return false;
	}
	if(!categoryId) {
		var txt = '全部分类时无法排序';
		window.wxc.xcConfirm(txt, 'confirm');
		return false;
	}
	myAjax(url, 'post', data).then(function(res) {

			var nowPage = $('.nowPage').html();
			var data = {
				limit: limit,
				offSet: (nowPage - 1) * limit,
				categoryId: categoryId,
				typeId: typeid
			}
			getManagerSource(data);
		},
		function(res) {
			var errorCode = res.errorCode;
			var txt = '';
			if(type == 'desc') {
				txt = '目前已是第一条';
			} else {
				txt = '目前已是最后一条';
			}
			if(errorCode != 403) {
				window.wxc.xcConfirm(txt, 'confirm');
			}
		})

}
//获取直播资源详情
function getDetail(id) {
	var url = '/api/v1/programs/' + id;
	myAjax(url, 'get').then(function(res) {
		var data = res.data;
		console.log(data);
		var cateid = data.categoryId;
		var typeid = data.type.split(',');
		var AllType = $('.scanningAlert_typebox span');
		var Allcate = $('#scanningAlertChannel li');
		var typeStr = [];
		idArr = data.type.split(',');
		$('.scanningAlert_typebox').find('label').removeClass('label');
		$('#scanningAlert_name').val(data.programName);
		$('#scanningAlertDire').val(data.programInfo.director);
		$('#scanningAlertYear').val(data.programInfo.year);
		$('#scanningAlertArea').val(data.programInfo.area);
		$('#scanningAlertCast').val(data.programInfo.cast);
		$('#scanningAlertInputImg').val(data.programInfo.imgPreview);
		$('#scanningAlertInfo').val(data.programInfo.introduct);
		$('.scanningAlertpreImg').data('smallimg', data.programInfo.smallImg);
//		$('.preImg')[0].src = data.programInfo.imgPreview;
		$('.save').data('source', data.programPlayList);
		$('.URLList').empty();
		$.each(data.programPlayList, function(ind, ele) {
			$('.URLList').append("<li>" +
				"<span style='width:7%;'>" + (ind + 1) + "</span>" +
				"<span class='url' style='width:60%'>" + ele.viewPreview + "</span>" +
				"<span id=" + ele.name + " sort=" + ele.sort + " style='width:20%'> <img class='sourceUP' src='../img/up-normal.png'/> <img class='sourceDown' src='../img/down-normal.png'/>  </span>" +
				"<span style='width:13%'><img class='prevVideo' src='../img/videoPlay.png'/> </span>" +
				"</li>")
		});
		$.each(Allcate, function(ind, ele) {
			var id = $(ele).prop('value');
			if(id == cateid) {
				$(ele).addClass('active');
				var text = $(ele).text();
				$('#scanningAlertInput').val(text);
			}
		});
		for(var i = 0; i < AllType.length; i++) {
			var id = AllType.eq(i).find('label').attr('id');
			for(var j = 0; j < typeid.length; j++) {
				var tid = typeid[j];
				if(id == tid) {
					var text = AllType.eq(i).text();
					typeStr.push(text);
					AllType.eq(i).find('label').addClass('label');
				}
			}
		}
		typeStr = typeStr.join(',');
		$('#scanningAlertTypeInput').val(typeStr);
		$('.scanningAlert').show();
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		if(!edit) {
			var widthNone = $('#scanningAlertFileImg').width();
			var widthInput = $('#scanningAlertInputImg').width();
			var newWidthInput = parseInt(widthNone) + parseInt(widthInput);
			$('#scanningAlertInputImg').width(newWidthInput);
		}

	})
}

function getManagerSource(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/programs';
	var typeid = $('#typeSelect').find('.active').prop('value');
	var categoryId = $('#classificationSelect').find('.active').prop('value');
	if(typeid) {
		data.typeId = typeid;
	}
	if(categoryId) {
		data.categoryId = categoryId
	}
	myAjax(url, 'get', data).then(function(res) {
		var data = res.data;
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$('.mangerList').empty();
		$('.nextPage').data('next', data.nextPage.url);
		$('.alert label').removeClass('label');
		$('.typebox').hide();
		typeArr = [];
		if(data.prePage) {
			$('.prevPage').data('prev', data.prePage.url);
		}
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
	}, function(res, data) {
		var data = data;
		if(!data) {
			$('.loadingAlert').hide();
			return false;
		}
		var offSet = data.offSet;
		if(offSet > 0) {
			data.offSet = offSet - 20;
			getManagerSource(data);
		} else {
			$('.loadingAlert').hide();
			$('.mangerList').empty();
			var message = res.message;
			var tr = document.createElement('li');
			$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
			$('.mangerList').append(tr);
			$('.allPage').html('1'); //总页数
			$('.count').html('0'); //总条数
			$('.nowPage').html('1'); //当前页数
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

function callBackPage(ind) {
	var id = $('#classificationSelect').find('.active').prop('value');
	var typeid = $('#typeSelect').find('.active').prop('value');
	var url = '/api/v1/programs';
	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
		categoryId: id,
		typeId: typeid
	}
	myAjax(url, 'get', data).then(function(res) {
		console.log(res)
		var edit = '';
		if(sessionStorage) {
			edit = sessionStorage.getItem('edit');
		} else {
			edit = getCookie('edit');
		}
		var data = res.data;
		$('.loadingAlert').hide();
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$('.mangerList').empty();
		$.each(data.program, function(ind, ele) {
			var tr = document.createElement('li');
			var order = (data.onPage - 1) * limit + ind + 1;
			var tranc = ele.transPercent;
			var trancInfo = '';
			$(tr).append("<span style='width: 7%;'>" + order + "</span>");
			
			if(tranc>=0) {
				trancInfo = '(正在转码)';
				$(tr).append("<span class='showtitle ' style='width: 25%;'>" + ele.programName + " <i class='jumpTrancList' style='color:dodgerblue;font-style:normal;cursor: pointer;'>"+trancInfo+"</i> </span>")
			}else{
				$(tr).append("<span class='showtitle ' style='width: 25%;'>" + ele.programName +"</span>")
			}
			$(tr).append("<span style='width: 15%;'>" + ele.categoryName + "</span>")
				.append("<span class='showtitle' style='width: 15%;'>" + ele.programInfo.area + "</span>")
				.append("<span class='showtitle' style='width: 22%;'>" + ele.programInfo.director + "</span>")
			if(edit) {
				$(tr).append("<span style='width: 16%;' id=" + ele.id + "> <img  title='编辑' categoryId=" + ele.categoryId + " class='emit' src='../img/emit-normal.png'> <img title='删除' class='dele' src='../img/dele-normal.png'> <img title='升序' class='desc' src='../img/up-normal.png'> <img class='asc' title='降序' src='../img/down-normal.png'> </span>");
			} else {
				$(tr).append("<span style='width: 16%;' id=" + ele.id + "> <img  title='查看' categoryId=" + ele.categoryId + " class='emit' src='../img/chakan.png'> </span>");
			}

			$('.mangerList').append(tr);
		})
	}, function(res) {

	})
}
//获取分类
function getChannel() {
	var url = '/api/v1/vodCategory';
	var data = data;
	myAjax(url, 'get', data).then(function(res) {
		$.each(res.data.category, function(ind, ele) {
			var id = ele.id;
			var name = ele.name;
			$('#scanningAlertChannel').append("<li  value=" + id + " >" + name + "</li>");
			$('#classificationSelect').append("<li  value=" + id + ">" + name + "</li>");
		})

	}, function(res) {
		console.log(res)
	})
}
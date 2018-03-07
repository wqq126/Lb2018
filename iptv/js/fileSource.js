var idArr = [];
var typeArr = [];
var saveData = [];
var saveInd = 0;
$(function() {
	//浏览器 后退恢复slider
	backSlider('channel', 0);
	getChannel();
	getAlltype();
	getIp();
	$('.scanningAlert .URLList').on('mouseenter', '.url', function(e) {
		var self = $(e.target);
		self.prop('title', self.html());
	})
	//图片轮播
	var mySwiper = new Swiper('.swiper-container', {
		pagination: '.pagination',
		loop: false,
		grabCursor: true,
		paginationClickable: true
	})

	$('.arrow-left').on('click', function(e) {
		e.preventDefault()
		mySwiper.swipePrev()
	})
	$('.arrow-right').on('click', function(e) {
		e.preventDefault()
		mySwiper.swipeNext()
	})
	//隐藏预览图片
	$('.scanningAlert').on('click', '.cancelImg', function() {
		console.log('sss')
		$(this).parent().hide();
	})
	//下载工具
	$('.download').click(function() {
		var url = '../download/flashfxp.zip';
		downloadFile(url);
	})
	//图片上传
	$('#scanningAlertFileImg').change(function() {
		var file = this.files[0];
		if(window.FileReader) {
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(e) {
				$('.scanningAlertpreImg').data('imgsrc', e.target.result);
				$('#scanningAlertInputImg').val(e.target.result);
			}
		}
	})
	//视频预览
	$('.scanningAlert').on('click', '.prevVideo', function() {
		var videoSrc = $(this).parent().parent().find('span').eq(1).text();
		var videoObject = {
			container: '#video', //容器的ID或className
			variable: 'player', //播放函数名称
			duration: 0, //设置视频总时间
			autoplay: true, //是否自动播放
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
			console.log('eeeeee')
			$('.scanningAlertImgBox').html("<img src='../img/cancle.png' class='cancelImg' /> <p>暂无图片</p>");

		}

	})
	//选择分类
	$('.showscanningAlertChannel').click(function() {
		$('#scanningAlertChannel').show();
		return false;
	})
	$('#scanningAlertChannel').on('click', 'li', function() {
		var text = $(this).text();
		$(this).parent().hide();
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$('#scanningAlertInput').val(text);
		$('.cateError').html('');
	})
	//选择类型
	$('.scanningAlert_typebox').on('click', '.mylabel', function() {
		idArr = [];
		typeArr = [];
		if($(this).hasClass('label')) {
			$(this).removeClass('label');
		} else {
			$(this).addClass('label');
			$('.errorType').html('');
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
	//隐藏弹框
	$('.cancle').click(function() {
		$('.typebox').hide();
		typeArr = [];
		idArr = [];
		$('.salert').hide();
		$('.scanningAlert').hide();
		$('#video').empty();
	})
	//扫描
	$('.scanning').click(function() {
		$('.scaningAleart').show();
		getscanDir();
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
	//批量添加上一页
	$('.preData').click(function() {
		var nowPage = parseInt($('.scanningAlert .nowPage').html());
		if(nowPage > 1) {
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
			var type = $('#scanningAlertTypeInput').val();
			var base64src = $('.scanningAlertpreImg').data('smallimg');;
			var programPlayList = [];
			if(!cateid) {
				$('.cateError').html('不能为空');
				return false;
			}
			if(!name) {
				$('.errorName').html('不能为空');
				return false;
			}
			if(!type) {
				$('.errorType').html('不能为空');
				return false;
			}
			//检测名字长度
			if(getStrLen(name) > 32) {
				$('.errorName').html('最多输入16个汉字');
				return false;
			}
			//检测名称是否含有特殊字符
			if(!checkString(name)) {
				$('.errorName').html('含有非法字符');
				return false;
			}
			//检测年代输入
			if(isNaN(year)) {
				$('.errorYear').html('只能输入数字');
				return false;
			}
			if(year) {
				if(year < 1894 || year > new Date().getFullYear()) {
					$('.errorYear').html('请输入正确的年份');
					return false;
				}
			}
			//检测导演输入
			if(getStrLen(directorie) > 20) {
				$('.errorDirectories').html('最多输入10个汉字');
				return false;
			}
			if(directorie.replace(/[^0-9]/ig, "")) {
				$('.errorDirectories').html('名字不能包含数字');
				return false;
			}
			if(!checkString(directorie)) {
				$('.errorDirectories').html('含有非法字符');
				return false;
			}
			//检测地区输入
			if(getStrLen(area) > 20) {
				$('.errorArea').html('最多输入10个汉字');
				return false;
			}
			if(area.replace(/[^0-9]/ig, "")) {
				$('.errorArea').html('地区不能包含数字');
				return false;
			}
			if(!checkString(area)) {
				$('.errorArea').html('含有非法字符');
				return false;
			}
			//检测演员输入
			if(getStrLen(cast) > 30) {
				$('.errorCast').html('最多输入15个汉字');
				return false;
			}
			if(cast.replace(/[^0-9]/ig, "")) {
				$('.errorCast').html('名字不能包含数字');
				return false;
			}
			if(!checkString(cast)) {
				$('.errorCast').html('含有非法字符');
				return false;
			}
			//检测简介
			if(getStrLen(introduct) > 100) {
				$('.errorIntroduct').html('最多输入50个汉字');
				return false;
			}
			if(!checkString(introduct)) {
				$('.errorIntroduct').html('含有非法字符');
				return false;
			}
			$.each($('.URLList li'), function(ind, ele) {
				var data = {};
				var span3 = $(ele).find('span').eq(2);
				var sort = span3.attr('sort');
				var name = span3.attr('id');
				var url = $(ele).find('span').eq(1).html();
				data = {
					name: name,
					url: url,
					sort: sort,
					viewPreview: url
				}
				programPlayList.push(data)
			});
			
			var programInfo = {
				"year": year,
				"area": area,
				"cast": cast,
				"smallImg": base64src,
				"introduct": introduct,
				"director": directorie
			}
			programInfo = JSON.stringify(programInfo);
			programPlayList = JSON.stringify(programPlayList);
			idArr = [];
			$('.scanningAlert_typebox label').each(function(ind, ele) {
				if($(ele).hasClass('label')) {
					var id = $(ele).attr('id');
					idArr.push(id);
				}
			})
			var data = {
				programName: name,
				categoryId: cateid || 1,
				programPlayList: programPlayList,
				programInfo: programInfo,
				type: idArr.join(','),
				oldName: $('#scanningAlert_name').data('oldname'),
				oldCateName: $('#scanningAlert_name').data('catename'),
				taskInfoId: $('#scanningAlert_name').data('taskid'),
			};
			
			$('.nowPage').html(nowPage - 1);
			$('.nextData').html('下一页');
			$('.nextData').removeClass('save');
			console.log(data);
			console.log(nowPage)
			saveData[nowPage-1] = data;
			addScanningData(nowPage - 2, saveData[nowPage - 2]);
		} else {
			var txt = '目前就是第一条';
			window.wxc.xcConfirm(txt, 'confirm');
		}
	})
	//批量添加下一页
	$('.nextData').click(function() {
		var html = $(this).html();
		var nowPage = parseInt($('.scanningAlert .nowPage').html());
		var allPage = parseInt($('.scanningAlert .allPage').html());
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
		var type = $('#scanningAlertTypeInput').val();
		var base64src = $('.scanningAlertpreImg').data('smallimg');
		var programPlayList = [];
		if(!cateid) {
			$('.cateError').html('不能为空');
			return false;
		}
		if(!name) {
			$('.errorName').html('不能为空');
			return false;
		}
		if(!type) {
			$('.errorType').html('不能为空');
			return false;
		}
		//检测名字长度
		if(getStrLen(name) > 32) {
			$('.errorName').html('最多输入16个汉字');
			return false;
		}
		//检测名称是否含有特殊字符
		if(!checkString(name)) {
			$('.errorName').html('含有非法字符');
			return false;
		}
		//检测年代输入
		if(isNaN(year)) {
			$('.errorYear').html('只能输入数字');
			return false;
		}
		if(year) {
			if(year < 1894 || year > new Date().getFullYear()) {
				$('.errorYear').html('请输入正确的年份');
				return false;
			}
		}
		//检测导演输入
		if(getStrLen(directorie) > 20) {
			$('.errorDirectories').html('最多输入10个汉字');
			return false;
		}
		if(directorie.replace(/[^0-9]/ig, "")) {
			$('.errorDirectories').html('名字不能包含数字');
			return false;
		}
		if(!checkString(directorie)) {
			$('.errorDirectories').html('含有非法字符');
			return false;
		}
		//检测地区输入
		if(getStrLen(area) > 20) {
			$('.errorArea').html('最多输入10个汉字');
			return false;
		}
		if(area.replace(/[^0-9]/ig, "")) {
			$('.errorArea').html('地区不能包含数字');
			return false;
		}
		if(!checkString(area)) {
			$('.errorArea').html('含有非法字符');
			return false;
		}
		//检测演员输入
		if(getStrLen(cast) > 30) {
			$('.errorCast').html('最多输入15个汉字');
			return false;
		}
		if(cast.replace(/[^0-9]/ig, "")) {
			$('.errorCast').html('名字不能包含数字');
			return false;
		}
		if(!checkString(cast)) {
			$('.errorCast').html('含有非法字符');
			return false;
		}
		//检测简介
		if(getStrLen(introduct) > 100) {
			$('.errorIntroduct').html('最多输入50个汉字');
			return false;
		}
		if(!checkString(introduct)) {
			$('.errorIntroduct').html('含有非法字符');
			return false;
		}
		$.each($('.URLList li'), function(ind, ele) {
			var data = {};
			var span3 = $(ele).find('span').eq(2);
			var sort = span3.attr('sort');
			var name = span3.attr('id');
			var url = $(ele).find('span').eq(1).html();
			data = {
				name: name,
				url: url,
				sort: sort,
				viewPreview: url
			}
			programPlayList.push(data)
		});
		
		var programInfo = {
			"year": year,
			"area": area,
			"cast": cast,
			"smallImg": base64src,
			"introduct": introduct,
			"director": directorie
		}
		programInfo = JSON.stringify(programInfo);
		programPlayList = JSON.stringify(programPlayList);
		idArr = [];
		$('.scanningAlert_typebox label').each(function(ind, ele) {
			if($(ele).hasClass('label')) {
				var id = $(ele).attr('id');
				idArr.push(id);
			}
		})
		var data = {
			programName: name,
			categoryId: cateid || 1,
			programPlayList: programPlayList,
			programInfo: programInfo,
			type: idArr.join(','),
			oldName: $('#scanningAlert_name').data('oldname'),
			oldCateName: $('#scanningAlert_name').data('catename'),
			taskInfoId: $('#scanningAlert_name').data('taskid'),
		};
		
		console.log(data);
		saveData[nowPage - 1] = data;
		$('#video').empty();
		if($(this).hasClass('save')) {
			var txt = '正在上传请耐心等候...';
			window.wxc.xcConfirm(txt, 'confirm');
			$('.sgBtn').hide();
			$('.clsBtn').hide();
			var url = '/api/v1/programs';
			$.each(saveData, function(ind, ele) {
				var data = saveData[ind];
				myAjax(url, 'post', data).then(function() {
					saveInd = saveInd + 1;
					if(saveInd == saveData.length) {
						$('.xcConfirm').hide();
						$('.scanningAlert').hide();
						var txt = '全部上传完成';
						window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.success);
						if($('.scanningAlert video').length > 0) {
							$('.scanningAlert video')[0].pause();
						}
					}
				}, function(res) {
					console.log(res)
					$('.xcConfirm').hide();
					var txt = '保存失败';
					window.wxc.xcConfirm(txt, 'confirm');
					return false;
				})
			});
		} else {
			if(nowPage < allPage) {
				if(saveData[nowPage]) {
					addScanningData(nowPage, saveData[nowPage]);

				} else {
					addScanningData(nowPage);
				}
				$('.nowPage').html(nowPage + 1);
				if(nowPage + 1 == allPage) {
					$('.nextData').html('保存');
					$('.nextData').addClass('save');
				}
			}

		}

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

//获取扫描凭证
function getscanDir() {
	var url = '/api/v1/programs/scanDir';
	myAjax(url, 'get').then(function(res) {
		console.log(res)
		var taskid = res.data.taskId;
		getResult(taskid);
	}, function(res) {
		console.log(res)
		if(res) {
			var txt = '未扫描到任何数据';
			window.wxc.xcConfirm(txt, 'confirm');
		}
		$('.scaningAleart').hide();

	})
}
//获取扫描结果
function getResult(id) {
	var url = '/api/v1/programs/scanResult';
	myAjax(url, 'post', {
		taskId: id
	}).then(function(res) {
		console.log(res)
		$('.scaningAleart').hide();
		$('.scanningAlert .error').html('');
		$('.scanningAlert label').removeClass('label');
		$('.scanningAlert').show();
		$('.scanningAlert').data('data', res.data);
		$('.scanningAlert .allPage').html(res.data.length);
		$('.scanningAlert .nowPage').html(1);
		$('.scanningAlert .nextData').html('下一条');
		$('.scanningAlert .nextData').removeClass('save');
		saveData = [];
		saveInd = 0;
		addScanningData(0);
	}, function(res) {
		$('.scaningAleart').hide();
		var txt = "扫描失败";
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
		$('.alert').hide();
	})
}

function addScanningData(ind, data) {
	idArr = [];
	typeArr = [];
	var AllType = $('.scanningAlert_typebox span');
	var typeStr = [];
	var typeid = [];
	var programPlayList = '';
	var allPage = parseInt($('.scanningAlert .allPage').html());
	var vid = $('.scanningAlert video')[0];
	var Allcate = $('#scanningAlertChannel li');
	var cateid = '';
	var name = '';
	var taskid = '';
	var categoryName = '';
	var imgPreview = '';
	var smallImg = '';
	var programInfo = '';
	$('.scanningAlert .error').html('');
	$('.scanningAlert input').val('');
	$('.scanningAlert textarea').val('');
	$('#scanningAlertTypeInput').val('');
	$('#video').empty();
	$('#video').append("<div class='pretitle' >视频预览</div>");
	if(data) {
		programPlayList = data.programPlayList;
		programPlayList = JSON.parse(programPlayList);
		name = data.programName;
		cateid = data.categoryId;
		categoryName = data.categoryName;
		taskid = data.taskInfoId;
		programInfo = data.programInfo;
		programInfo = JSON.parse(programInfo)
		smallImg = programInfo.smallImg;
		typeid = data.type.split(',');
		$('#scanningAlertDire').val(programInfo.director);
		$('#scanningAlertInfo').val(programInfo.introduct);
		$('#scanningAlertYear').val(programInfo.year);
		$('#scanningAlertArea').val(programInfo.area);
		$('#scanningAlertCast').val(programInfo.cast);
	} else {
		var data = $('.scanningAlert').data('data')[ind];
		name = data.name;
		cateid = data.categoryId;
		programPlayList = data.programPlayList;
		taskid = data.id;
		categoryName = data.categoryName;
		imgPreview = data.imgPreview;
		smallImg = data.smallImg;
		if(data.type) {
			typeid = data.type.split(',');
		}

	}
	if(ind + 1 == allPage) {
		$('.nextData').addClass('save');
		$('.nextData').html('保存');
	}

	$('.scanningAlert_typebox label').removeClass('label');
	$('#scanningAlert_name').val(name);
	$('#scanningAlert_name').data('oldname', name);
	$('#scanningAlert_name').data('taskid', taskid);
	$('#scanningAlert_name').data('catename', categoryName);
	$('#scanningAlertInputImg').val(imgPreview || smallImg);
	$('.scanningAlertpreImg').data('smallimg', smallImg);
	$('.URLList').empty();
	if(typeid) {
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
	}
	$.each(programPlayList, function(ind, ele) {
		var name = ele.name || 0;
		$('.URLList').append("<li>" +
			"<span style='width:7%'>" + (ind + 1) + "</span>" +
			"<span class='url' style='width:60%'>" + ele.viewPreview + "</span>" +
			"<span id=" + name + " sort=" + ele.sort + " style='width:20%'> <img class='sourceUP' src='../img/up-normal.png'/> <img class='sourceDown' src='../img/down-normal.png'/>  </span>" +
			"<span style='width:13%'><img class='prevVideo' src='../img/videoPlay.png'/> </span>" +
			"</li>")
	});
	$.each(Allcate, function(ind, ele) {
		var id = $(ele).prop('value');
		if(id == cateid) {
			$(ele).addClass('active');
			$(ele).siblings().removeClass('active');
			var text = $(ele).text();
			$('#scanningAlertInput').val(text);
		}
	});

}

//获取分类
function getChannel() {
	var url = '/api/v1/vodCategory';
	var data = data;
	myAjax(url, 'get', data).then(function(res) {
		$.each(res.data.category, function(ind, ele) {
			var id = ele.id;
			var name = ele.name;
			$('#scanningAlertChannel').append("<li value=" + id + " >" + name + "</li>");
		})

	}, function(res) {})
}
//获取所有的类型
function getAlltype() {
	var url = '/api/v1/types';
	myAjax(url, 'get').then(function(res) {
		$.each(res.data.type, function(ind, ele) {
			$('.scanningAlert_typebox').append("<span><input id='isRemer' type='checkbox'><label id=" + ele.id + " class=' mylabel'></label> <span>" + ele.name + "</span></span>")
			$('.typebox').append("<span><input id='isRemer' type='checkbox'><label id=" + ele.id + " class=' mylabel'></label>" + ele.name + "</span>")
			$('.typeboxs').append("<span><input id='isRemer' type='checkbox'><label id=" + ele.id + " class=' mylabel'></label>" + ele.name + "</span>")
		});
	}, function(res) {})
}

function getIp() {
	myAjax('/api/v1/config/serverip', 'get').then(function(res) {
		var ip = res.data;
		$('#ftpip').html(ip);
	})
}
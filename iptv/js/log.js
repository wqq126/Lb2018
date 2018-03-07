var allUserName = '';
$(function() {
	//浏览器 后退恢复slider
	backSlider('setting', 0);
	var data = {
		limit: limit,
		offSet: 0
	}
	//日期初始化
	$.datetimepicker.setLocale('ch')
	$('#startTime').datetimepicker({
		dayOfWeekStart: 1,
		maxDate: new Date(),
		format: 'Y-m-d H:i',
		step: 10,

	});
	$('#endTime').datetimepicker({
		dayOfWeekStart: 1,
		maxDate: new Date(),
		format: 'Y-m-d H:i',
		step: 10
	});
	//开始时间选择后再次初始化结束时间
	$('#startTime').on('change', function() {
		$('#endTime').datetimepicker({
			dayOfWeekStart: 1,
			maxDate: new Date(),
			minDate: $('#startTime').val(),
			format: 'Y-m-d H:i',
			step: 10
		});
	})
	$('.searchLog').click(function() {
		$('.showdown').show();
		getLog({
			limit: limit,
			offSet: 0
		});
	})
	//获取 所有的日志
	getLog(data);
	//获取所有用户
	getAllUser();
	//模糊搜索
	$('#nameSearchInput').on('input propertychange', function() {
		var inputStr = $(this).val();
		var boxSearch = $('#nameSelect');
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
	$('#nameSelect').on('click', 'li', function() {
		var name = $(this).text();
		$(this).parent().hide();
		$('#nameSearchInput').val(name);
	})
	$('#searchLog').click(function() {
		$('#nameSelect').hide();
		var data = {
			limit: limit,
			offSet: 0
		}
		getLog(data);
	})

	$('.ul_tbody').on('mouseenter', 'span', function(e) {
		var self = $(e.target);
		self.prop('title', self.html());
	})

})

function getLog(data) {
	$('.loadingAlert').show();
	var url = '/api/v1/iptvActionLog';
	var startTime = $('#startTime').val();
	var endTime = $('#endTime').val();
	startTime = new Date(Date.parse(startTime.replace(/-/g, "/")));
	startTime = startTime.getTime();
	endTime = new Date(Date.parse(endTime.replace(/-/g, "/")));
	endTime = endTime.getTime();
	var userName = $.trim($('#nameSearchInput').val());
	if(userName) {
		data.userName = userName;
	}
	if(startTime) {
		data.timeStart = startTime / 1000;
	}
	if(endTime) {
		data.timeEnd = endTime / 1000;
	}
	if(startTime && endTime) {

		if(endTime <= startTime) {
			$('.loadingAlert').hide();
			$('.showdown').hide();
			$('#startTime').val('');
			$('#endTime').val('');
			var txt = '结束时间要大于开始时间';
			window.wxc.xcConfirm(txt, 'confirm');
			return false;
		}
	}
	myAjax(url, 'get', data).then(function(res) {
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
		$('.loadingAlert').hide();
		$('.showdown').hide();
		console.log(res)
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
	})
}

function callBackPage(ind) {
	$('.xcConfirm').hide();
	var url = '/api/v1/iptvActionLog';
	var startTime = $('#startTime').val();
	var endTime = $('#endTime').val();
	startTime = new Date(Date.parse(startTime.replace(/-/g, "/")));
	startTime = startTime.getTime();
	endTime = new Date(Date.parse(endTime.replace(/-/g, "/")));
	endTime = endTime.getTime();
	var userName = $.trim($('#nameSearchInput').val());

	var data = {
		limit: limit,
		offSet: (ind - 1) * limit,
	}
	if(userName) {
		data.userName = userName;
	}
	if(startTime) {
		data.timeStart = startTime / 1000;
		console.log(startTime)
	}
	if(endTime) {
		data.timeEnd = endTime / 1000;
		console.log(endTime)
	}

	myAjax(url, 'get', data).then(function(res) {
		$('.loadingAlert').hide();
		$('.showdown').hide();
		var data = res.data;
		var userInfo = data.userInfo;
		$('.allPage').html(data.allPage); //总页数
		$('.count').html(data.count); //总条数
		$('.nowPage').html(data.onPage); //当前页数
		$('.ul_tbody').empty();
		for(var i = 0; i < userInfo.length; i++) {
			var order = (data.onPage - 1) * limit + i + 1;
			var userName = userInfo[i].userName;
			var groupName = userInfo[i].roleName;
			var action = userInfo[i].desc;
			var time = userInfo[i].createTime;
			var type = userInfo[i].type;
			var typeName = '';
			if(type == 1) {
				typeName = '后台';
			}
			if(type == 2) {
				typeName = '客户端';
			}
			$('.ul_tbody').append("<li><span style='width: 7%;'>" + order + "</span>" +
				"<span style='width: 15%;'>" + userName + "</span>" +
				"<span style='width: 12%;'>" + groupName + "</span>" +
				"<span style='width: 10%;'>" + typeName + "</span>" +
				"<span style='width: 36%;'>" + action + "</span>" +
				"<span style='width: 20%;'>" + time + "</span> </li>");
		}

	}, function(res) {
		$('.ul_tbody').empty();
		$('.allPage').html('1'); //总页数
		$('.count').html('0'); //总条数
		$('.nowPage').html('1'); //当前页数
		var message = '未获取到数据';
		var tr = document.createElement('li');
		$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
		$('.ul_tbody').append(tr);
	})
}

//获取所有的用户
function getAllUser() {
	var url = '/api/v1/readUser';
	myAjax(url, 'get').then(function(res) {
		console.log(res)
		var data = res.data
		allUserName = res.data;
		//		for(var i = 0; i < data.length; i++) {
		//			var name = data[i].userName;
		//			$('#mylist').append("<option>" + name + "</option>")
		//		}
	}, function(res) {
		console.log(res)

	})
}
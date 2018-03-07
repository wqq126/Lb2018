$(function() {
	
	//浏览器 后退恢复slider
	backSlider('channel', 2);
	getAllTrans();
	//日期初始化
	$.datetimepicker.setLocale('ch')
	$('#startTime').datetimepicker({
		dayOfWeekStart: 1,
		timepicker:false,
		maxDate: new Date(),
		format: 'Y-m-d',
		step: 10,
	});
	$('#endTime').datetimepicker({
		dayOfWeekStart: 1,
		timepicker:false,
		maxDate: new Date(),
		format: 'Y-m-d',
		step: 10
	});
	//开始时间选择后再次初始化结束时间
	$('#startTime').on('change', function() {
		$('#endTime').datetimepicker({
			dayOfWeekStart: 1,
			maxDate: new Date(),
			minDate: $('#startTime').val(),
			format: 'Y-m-d',
			step: 10
		});
	})
	//刷新列表
	$('.reloadBtn').click(function() {
		var page = $('.nowPage').html();
		getAllTrans(page);
	})
	//搜索
	$('.searchLog').on('click', function() {
		getAllTrans();
	})
})
//获取转码列表
function getAllTrans(page) {
	var url = '/api/v1/transCode';
	var startTime = $('#startTime').val();
	var endTime = $('#endTime').val();
	startTime = new Date(Date.parse(startTime.replace(/-/g, "/")));
	startTime = startTime.getTime();
	endTime = new Date(Date.parse(endTime.replace(/-/g, "/")));
	endTime = endTime.getTime();
	startTime = startTime / 1000;
	endTime = endTime / 1000;
	var dataAjax = {
		limit: limit,
		page: page ||1,
	}
	if(startTime) {
		dataAjax.startTime = startTime;
	}
	if(endTime) {
		dataAjax.endTime = endTime + 24*3600;
	}
	if(startTime && endTime) {

		if(endTime < startTime) {
			$('.loadingAlert').hide();
			$('.showdown').hide();
			$('#startTime').val('');
			$('#endTime').val('');
			var txt = '结束时间要大于开始时间';
			window.wxc.xcConfirm(txt, 'confirm');
			return false;
		}
//		if(endTime == startTime ){
//			endTime = endTime + 24*3600;
//		}
	}
	console.log(dataAjax)
	myAjax(url, 'get', dataAjax).then(function(res) {
		$('.loadingAlert').hide();
		var data = res.data;
		$('.ul_tbody').empty();
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			callBackPage(n, dataAjax);
		}, {
			pageCount:res.data.allPage,//总页码,默认10
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
		$('.loadingAlert').hide();
		//初始化分页&自定义样式
		$('.page').createPage(function(n) {
			//切换页码的回调
			//			callBackPage(n)
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
		var message = '未获取到数据';
		var tr = document.createElement('li');
		$(tr).append("<span	style='justify-content: center; width: 100%;text-align: center;'>" + message + "</span>")
		$('.ul_tbody').append(tr);
	})
}

function callBackPage(n, data) {
	var url = '/api/v1/transCode';
	var data = data;
		data.page = n;
	console.log(data);	
	myAjax(url, 'get', data).then(function(res) {
		var data = res.data.transCodeList;
		$('.allPage').html(res.data.allPage); //总页数
		$('.count').html(res.data.count); //总条数
		$('.nowPage').html(res.data.onPage); //当前页数
		console.log(res.data.onPage);
		console.log(res)
		var bodyHtml = "";
		$('.ul_tbody').empty();
		for(var i = 0; i < data.length; i++) {
			var name = data[i].programName;
			var startTime = data[i].beginTime * 1000;
			if(startTime) {
				startTime = format(startTime);
			}
			var endTime = data[i].endTime * 1000;
			if(endTime) {
				endTime = format(endTime);
			}
			var listName = data[i].listName;
			var order = (res.data.onPage - 1) * limit + i + 1;
			var status = data[i].state;
			var statuInfo = '';
			var percent = data[i].percent - 0;
			var errorInfo = data[i].errorInfo;
			var fontColor = ''
			percent = percent * 100;
			percent = percent.toFixed(2) + "%";
			name = name + '—' + listName;
			if(status == 0) {
				statuInfo = '等待转码';
				fontColor = '#595959';
			}  
			if(status == 1) {
				statuInfo = '转码完成';
				fontColor = '#3872b6';
			}
			if(status == 2) {
				statuInfo = '正在转码';
				fontColor = '#595959'
			}
			if(status == 3) {
				statuInfo = '转码失败';
				fontColor = 'red';
			}
			var tr = document.createElement('li');
			$(tr).append("<span style='width: 7%;'>" + order + "</span>")
				.append("<span style='width: 26%;'>" + name + "</span>");
			if(status == 3){
				$(tr).append("<span style='width: 31%;color:"+fontColor+"'>" + statuInfo + "&nbsp;&nbsp;&nbsp;&nbsp;"+errorInfo +"</span>");
			}else{
				$(tr).append("<span style='width: 31%;color:"+fontColor+"'>" + statuInfo + "<i class='myRange'><i class='myRangeValue' style='width: " + percent + ";' ></i></i><i class='transcPer'>" + percent + "</i></span>");
			}
			$(tr).append("<span style='width: 18%;'>" + startTime + "</span>")
				.append("<span style='width: 18%;'>" + endTime + "</span>");
			          
			var bodyHtml = "<li class='theader clearfix'>" +
				"<span style='width: 7%;'>" + order + "</span>" +
				"<span style='width: 26%;'>" + name + "</span>" +
				"<span style='width: 31%;'>" + statuInfo + "<i class='myRange'><i class='myRangeValue' style='width: " + percent + ";' ></i></i><i class='transcPer'>" + percent + "</i></span>" +
				"<span style='width: 18%;'>" + startTime + "</span>" +
				"<span style='width: 18%;'>" + endTime + "</span>" +
				"</li>";
			$('.ul_tbody').append(tr);
		}

	})
}
//时间戳转时间
function add0(m) {
	return m < 10 ? '0' + m : m
}

function format(shijianchuo) {
	//shijianchuo是整数，否则要parseInt转换
	var time = new Date(shijianchuo);
	var y = time.getFullYear();
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	var s = time.getSeconds();
	return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}
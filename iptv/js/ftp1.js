var now = new Date();
var xdata = [];
var ydata1 = [];
var ydata2 = [];
$(function() {
	var token = '';
	if(sessionStorage) {
		token = sessionStorage.getItem("token");
	} else {
		token = getCookie('token');
	}
	if(!token) {
		window.location.href = 'font/login.html';
	}
	$('.saveIP').click(function() {
		var ip = $('#ip').val();
		var port = $('#port').val();
		var isRight = !!ip.match(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/);
		var paramIp = ip + ":" + port
		console.log(isRight);
		if(isRight) {
			getServerAbstractInfo(paramIp);
			myChart.setOption(option);
//			addData(myChart, paramIp).then(function(){
//				
//			})
//			addData(myChart, paramIp).then(function() {
//				setInterval(function() {
//					getServerAbstractInfo(paramIp);
//					echarts.dispose($('.brokenChart')[0]);
//					var myChart = echarts.init($('.brokenChart')[0]);
//					addData(myChart, paramIp);
//				}, 3000)
//			})

		} else {
			var txt = "ip输入错误";
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
		}

	})
	echarts.dispose($('.brokenChart')[0]);
	var myChart = echarts.init($('.brokenChart')[0]);
	var option = {
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				label: {
					backgroundColor: '#6a7985'
				}
			}
		},
		xAxis: [{
			type: 'category',
			boundaryGap: false,
			data: xdata
		}],
		yAxis: [{
			type: 'value'
		}],
		series: [{
				name: '上传速递',
				type: 'line',
				stack: '总量',
				areaStyle: {
					normal: {
						color: '#f48476',
						opcity: 0.3, //区域颜色
						lineStyle: {
							color: '#f48476' //折线颜色
						}
					}
				},
				data: ydata1
			},
			{
				name: '下载',
				type: 'line',
				stack: '总量',
				label: {
					normal: {
						show: true,
						position: 'top',

					}
				},
				areaStyle: {
					normal: {
						color: '#b7d870',
						opcity: 0.3, //区域颜色
						lineStyle: {
							color: '#b7d870' //折线颜色
						}
					}
				},
				data: ydata2
			}
		]
	};

})

function addData(myChart, ip) {
	var dtd = new $.Deferred();
	var url = 'http://' + ip + '/api/v1/summaries'
	var curtime = new Date();
	var tmp = curtime.getHours() + ':' + curtime.getMinutes() + ":" + curtime.getSeconds();
	var option = myChart.getOption();
	var ydata1 = option.series[0].data;
	var ydata2 = option.series[1].data;
	var xdata = option.xAxis[0].data;
	myAjax(url, 'get').then(function(res) {
		var data = res.data.system;
		var uptime = data.uptime;
		var net_sendi_bytes = data.net_sendi_bytes;
		var net_recvi_bytes = data.net_recvi_bytes;
		var si = conver((data.net_send_bytes - data.net_sendi_bytes) / uptime)
		var ri = conver((data.net_recv_bytes - data.net_recvi_bytes) / uptime)
		si = parseInt(si);
		ri = parseInt(ri);

		var net_send_bytes = data.net_send_bytes; //总发出
		var net_recv_bytes = data.net_recv_bytes; //总接受

		var s = conver(net_send_bytes);
		var r = conver(net_recv_bytes);
		$('.sendSpeed').html(si + 'KB');
		$('.recvSpeed').html(ri + "KB");
		$('.allsend').html(s);
		$('.allreci').html(r);
		if(option.xAxis[0].data.length > 100) {
			option.xAxis[0].data.shift();
			option.series[0].data.shift();
			option.series[1].data.shift();
		}
		option.xAxis[0].data.push(tmp);

		option.series[0].data.push(si);
		option.series[1].data.push(ri);

		myChart.setOption(option);
		dtd.resolve();
	})
	dtd.promise();
}

//获取服务器摘要信息
function getServerAbstractInfo(ip) {
	var url = 'http://' + ip + '/api/v1/summaries';
	myAjax(url, 'get').then(function(res) {
		console.log(res)
		var data = res.data.system;
		var cpu_percent = data.cpu_percent;
		var cpu = cpu_percent * 100;
		var cpuhtml = cpu.toFixed(2);
		var mem_ram_percent = data.mem_ram_percent;
		var mem = mem_ram_percent * 100;
		var menhtml = mem.toFixed(2);
		var disk_busy_percent = data.disk_busy_percent
		var disk = disk_busy_percent * 100;
		var diskhtml = disk.toFixed(2);
		var net_sendi_bytes = data.net_sendi_bytes;
		var net_recvi_bytes = data.net_recvi_bytes;
		$('.version').html('服务器版本:' + res.data.self.version)
		$('.cpu_percent').html(cpuhtml + '%');
		$('.men_percent').html(menhtml + '%')
		$('.disk_busy_percent').html(diskhtml + '%')
		renderCpu(cpu_percent, 1 - cpu_percent);
		renderMemory(mem_ram_percent, 1 - mem_ram_percent);
		renderHardDisk(disk_busy_percent, 1 - disk_busy_percent);
	})
}

function conver(limit) {
	var size = "";
	size = (limit / 1024).toFixed(2) + "KB";
	//
	//		if(limit < 0.1 * 1024) { //如果小于0.1KB转化成B  
	//			size = limit.toFixed(2) + "B";
	//		} else if(limit < 0.1 * 1024 * 1024) { //如果小于0.1MB转化成KB  
	//			size = (limit / 1024).toFixed(2) + "KB";
	//		} else if(limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB  
	//			size = (limit / (1024 * 1024)).toFixed(2) + "MB";
	//		} else { //其他转化成GB  
	//			size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
	//		}

	var sizestr = size + "";
	var len = sizestr.indexOf("\.");
	var dec = sizestr.substr(len + 1, 2);
	if(dec == "00") { //当小数点后为00时 去掉小数部分  
		return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
	}
	return sizestr;
}

function myAjax(url, type, data) {
	var dtd = new $.Deferred();
	$.ajax({
		type: type,
		url: url,
		dataType: 'jsonp',
		processData: false,
		async: true,
		success: function(res) {
			if(res.code == '0') {
				dtd.resolve(res)
			} else if(res.errorCode == 403) {
				window.parent.location.href = 'login.html';
			} else {
				dtd.reject(res)
			}
		},
		error: function(res) {
			var txt = '请检查网络或地址';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
			return false;
		}
	});
	return dtd.promise();
}

function renderHardDisk(use, all) {
	echarts.dispose(document.getElementById('dardDiskChart'));
	var myChart = echarts.init(document.getElementById('dardDiskChart'));
	var option = {
		tooltip: {
			trigger: 'item',
			formatter: "{d}%",
			show: false,
			enterable: true
		},
		color: ['#5eacd3', '#828282'], //手动设置每个图例的颜色
		legend: {
			//right:100,  //图例组件离右边的距离
			orient: 'horizontal', //布局  纵向布局 图例标记居文字的左边 vertical则反之
			width: 40, //图行例组件的宽度,默认自适应
			x: '20%', //图例显示在右边
			y: 'bottom', //图例在垂直方向上面显示居中
			itemWidth: 10, //图例标记的图形宽度
			itemHeight: 10, //图例标记的图形高度
			data: ['硬盘内存'],
			textStyle: { //图例文字的样式
				color: '#333', //文字颜色
				fontSize: 16 //文字大小
			}
		},
		series: [{
			name: '比例',
			type: 'pie',
			center: ['50%', '50%'],
			radius: ['70%', '80%'],
			hoverAnimation: false,
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				},
				emphasis: {
					label: {
						show: false,
						position: 'center',
						textStyle: {
							fontSize: '18',
							fontWeight: 'bold'
						}
					}
				}
			},
			data: [{
					value: use,
					name: '硬盘内存'
				},
				{
					value: all,
					name: '/1G'
				},
			]
		}]
	}
	myChart.setOption(option);
}

function renderMemory(use, all) {
	echarts.dispose(document.getElementById('memoryChart'));
	var myChart = echarts.init(document.getElementById('memoryChart'));
	var option = {
		tooltip: {
			trigger: 'item',
			formatter: "{d}%",
			show: false,
			enterable: true
		},
		color: ['#a5a832', '#828282'], //手动设置每个图例的颜色
		legend: {
			//right:100,  //图例组件离右边的距离
			orient: 'horizontal', //布局  纵向布局 图例标记居文字的左边 vertical则反之
			width: 40, //图行例组件的宽度,默认自适应
			x: '20%', //图例显示在右边
			y: 'bottom', //图例在垂直方向上面显示居中
			itemWidth: 10, //图例标记的图形宽度
			itemHeight: 10, //图例标记的图形高度
			data: ['占用内存'],
			textStyle: { //图例文字的样式
				color: '#333', //文字颜色
				fontSize: 16 //文字大小
			}
		},
		series: [{
			name: '比例',
			type: 'pie',
			center: ['50%', '50%'],
			radius: ['70%', '80%'],
			hoverAnimation: false,
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				},
				emphasis: {
					label: {
						show: false,
						position: 'center',
						textStyle: {
							fontSize: '18',
							fontWeight: 'bold'
						}
					}
				}
			},
			data: [{
					value: use,
					name: '占用内存'
				},
				{
					value: all,
					name: '/1G'
				},
			]
		}]
	}
	myChart.setOption(option);
}

function renderCpu(use, all) {
	echarts.dispose(document.getElementById('cupChart'));
	var myChart = echarts.init(document.getElementById('cupChart'));
	var option = {
		tooltip: {
			trigger: 'item',
			formatter: "{d}%",
			show: false,
			enterable: true
		},
		color: ['#44b2b6', '#828282'], //手动设置每个图例的颜色
		legend: {
			//right:100,  //图例组件离右边的距离
			orient: 'horizontal', //布局  纵向布局 图例标记居文字的左边 vertical则反之
			width: 40, //图行例组件的宽度,默认自适应
			x: '20%', //图例显示在右边
			y: 'bottom', //图例在垂直方向上面显示居中
			itemWidth: 10, //图例标记的图形宽度
			itemHeight: 10, //图例标记的图形高度
			data: ['cpu占用率'],
			textStyle: { //图例文字的样式
				color: '#333', //文字颜色
				fontSize: 16 //文字大小
			}
		},
		series: [{
			name: '比例',
			type: 'pie',
			center: ['50%', '50%'],
			radius: ['70%', '80%'],
			hoverAnimation: false,
			itemStyle: {
				normal: {
					label: {
						show: false
					},
					labelLine: {
						show: false
					}
				},
				emphasis: {
					label: {
						show: false,
						position: 'center',
						textStyle: {
							fontSize: '18',
							fontWeight: 'bold'
						}
					}
				}
			},
			data: [{
					value: use,
					name: 'cpu占用率'
				},
				{
					value: all,
					name: '/1G'
				},
			]
		}]
	}
	myChart.setOption(option);
}
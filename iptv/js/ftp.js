var now = new Date();
var xdata = []; //x轴
var ydata1 = []; //y轴
var ydata2 = []; //y轴
var preSend = ''; //上一次发送带框总量
var preRecv = ''; //上一次接受带框总量
var ftpTime = 9; //秒
var option = ''; //带宽echart参数
var FTP_PORT = '1985' //ftp端口号
$(function() {
	//判断是否是admin

	if(!sessionStorage.getItem('isAdmin')) {
		$('.saveIP').hide();
	}
	//浏览器 后退恢复slider
	backSlider('home');
	//判断本地缓存是否有IP
//	var ip = '';
//	if(localStorage) {
//		ip = localStorage.getItem('ftpIp');
//
//	} else {
//		ip = getCookie('ftpIP');
//	}     
//	//本地缓存有ip
//	if(ip) {
//		getFtpData(ip);
//	}
//	//本地没有缓存
//	else {           
//		//进入请求ip
//		getIp();
//	}
	getIp();
	//设置ip，第一次进入系统设置ip
	$('.saveIP').click(function() {
		var isShow = $('#ip').prop('readonly');
		var ip = $('#ip').val();
		//检测ip是否合法
		var isRight = !!ip.match(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/);
		if(!isRight) {
			var txt = 'ip格式不正确';
			window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
			return false;
		}
		//保存ip
		if(!isShow) {
			$('.loading').show();
			var url = 'http://' + ip + ":" + FTP_PORT + '/api/v1/summaries';
			//请求ftp服务器数据
			myAjaxftp(url, 'get').then(function() {
				//ip正确 保存ip
				myAjax('/api/v1/config/serverip', 'put', {
					serverIp: ip
				}).then(function(res) {
					//ip保存成功
					var ip = res.data;
					if(localStorage) {
						localStorage.setItem('ftpIp', ip);
					} else {
						setCookie('ftpIP', ip);
					}
					xdata = [];
					ydata1 = [];
					ydata2 = [];
					preSend = '';
					preRecv = '';
					$('.loading').hide();
					var txt = '保存成功'
					var xoption = {
						title: '提示',
						btn: parseInt('0011', 2),
						onOk: function() {
							location.reload();
						},
						onCancle: function() {},
						onClose: function() {
							location.reload();
						}
					}
					window.wxc.xcConfirm(txt, "success", xoption);
					$('.xcConfirm .cancel').hide();
					getFtpData(ip);
				}, function(res) {
					//ip保存失败
					var txt = '保存失败';
					window.wxc.xcConfirm(txt, 'confirm');
					getIp();
				});
			}, function(res) {
				//ip错误
				var txt = '此ip无法连接'
				var xoption = {
					title: '提示',
					btn: parseInt('0011', 2),
					onOk: function() {
						location.reload();
					},
					onCancle: function() {},
					onClose: function() {
						location.reload();
					}
				}
				window.wxc.xcConfirm(txt, "confirm", xoption);
				$('.xcConfirm .cancel').hide();

			})

		}
		//修改IP
		else {
			//检测是否有权限
			$('#ip').prop('readonly', false);
			$('#ip').focus();
			$('#ip').css('border', '1px solid #D4D4D4');
			$('.saveIP').html('保存');
			return false;
		}

	})

	option = {
		animation: false,
		tooltip: {
			trigger: 'axis',
		},
		calculable: true,
		xAxis: [{
			type: 'category',
			axisLabel: {
				interval: 0,
				//				 rotate:45,
			},
			boundaryGap: false,
			data: xdata
		}],
		yAxis: [{
			type: 'value'
		}],
		series: [{
				name: '上传速递(MB)',
				type: 'line',
				smooth: true,
				itemStyle: {
					normal: {
						color: '#b7d870',
						areaStyle: {
							color: '#b7d870',
							opcity: 0.3, //区域颜色

						},
						lineStyle: {
							color: '#b7d870' //折线颜色
						}
					}
				},
				data: ydata1
			},
			{
				name: '下载速度(MB)',
				type: 'line',
				smooth: true,
				itemStyle: {
					normal: {
						color: '#f48476',
						areaStyle: {
							color: '#f48476',
							opcity: 0.3, //区域颜色
						},
						lineStyle: {
							color: '#f48476' //折线颜色
						}
					}
				},
				data: ydata2
			}
		]
	};

})

function getIp() {
	myAjax('/api/v1/config/serverip', 'get').then(function(res) {
		var ip = res.data;
		if(ip){
			getFtpData(ip);	
			sessionStorage.setItem('ip',ip);
		}else{
			var txt = 'ip未设置，请先设置ip';
			window.wxc.xcConfirm(txt, "confirm");
		}
		
	})
}

function getFtpData(ip) {
	var url = 'http://' + ip + ":" + FTP_PORT + '/api/v1/summaries';
	myAjaxftp(url, 'get').then(function(res) {
		$('#ip').val(ip);
		$('#ip').attr('readonly', 'readonly');
		$('#ip').css('border', 'none');
		$('.saveIP').html('修改');
		$('.loading').hide();
		preSend = res.data.system.net_send_bytes;
		preRecv = res.data.system.net_recv_bytes
		getIPData(res);
		echarts.dispose($('.brokenChart')[0]);
		var myChart = echarts.init($('.brokenChart')[0]);
		myChart.setOption(option);
		setInterval(function() {
			myAjaxftp(url).then(function(res) {
				var send = res.data.system.net_send_bytes;
				var recv = res.data.system.net_recv_bytes;
				getIPData(res);
				addData(myChart, send, recv);
			})
		}, ftpTime * 1000);

	}, function(res) {
		var txt = '此ip无法连接';
		$('.loading').hide();
		$('#ip').prop('readonly', 'readonly');
		$('#ip').blur();
		$('.saveIP').html('修改');
		$('.xcConfirm').hide();
		window.wxc.xcConfirm(txt, window.wxc.xcConfirm.typeEnum.error);
		var url = '/api/v1/config/serverip';
		myAjax(url, 'get').then(function(res) {
			var ip = res.data;
			$('#ip').val(ip);
			$('#ip').attr('readonly', 'readonly');
			$('#ip').css('border', 'none');
			$('.saveIP').html('修改');
			getFtpData(ip);
		})
	})
}

function addData(myChart, send, recv) {
	var curtime = new Date();
	var minute = curtime.getMinutes();
	var second = curtime.getSeconds();
	var hours = curtime.getHours();
	if(hours < 10) {
		hours = '0' + hours;
	}
	if(minute < 10) {
		minute = '0' + minute;
	}
	if(second < 10) {
		second = '0' + second;
	}
	var tmp = hours + ':' + minute + ":" + second;

	var option = myChart.getOption();
	var ydata1 = option.series[0].data;
	var ydata2 = option.series[1].data;
	var xdata = option.xAxis[0].data;
	var sendSpeed = (((send - preSend) / ftpTime) / (1024 * 1024));
	var recvSpeed = (((recv - preRecv) / ftpTime) / (1024 * 1024));
//	console.log('计算'+sendSpeed);
//	console.log('计算'+recvSpeed);
	if(sendSpeed<1 && recvSpeed<1){
		sendSpeed = sendSpeed.toFixed(5);
		recvSpeed = recvSpeed.toFixed(5);
//		console.log('5位'+sendSpeed);
	}else{
		sendSpeed = sendSpeed.toFixed(2);
		recvSpeed = recvSpeed.toFixed(2);
		
	}
	
//	var reSend = (send-preSend)/1000;
	if(sendSpeed < 0) {
		sendSpeed = 0;
	}
	if(recvSpeed < 0) {
		recvSpeed = 0;
	}
	var converSend = (send - preSend) / ftpTime;
	var converRecv = (recv - preRecv) / ftpTime;
		converSend = converSpeed(converSend);
		converRecv = converSpeed(converRecv);
	var s = (send / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
	var r = (recv / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
//	var sendData =parseFloat(converSend);
//	var recvData = parseFloat(converRecv);
	preSend = send;
	preRecv = recv;
	
	$('.sendSpeed').html(converSend+ '/s');
	$('.recvSpeed').html(converRecv+ '/s');
	$('.allsend').html(s);
	$('.allreci').html(r);
	
	
	if(option.xAxis[0].data.length > 12) {
		option.xAxis[0].data.shift();
		option.series[0].data.shift();
		option.series[1].data.shift();
	}
	//x轴
	option.xAxis[0].data.push(tmp);
	//y轴
	option.series[0].data.push(sendSpeed);
	option.series[1].data.push(recvSpeed);
	//	echarts.dispose($('.brokenChart')[0]);
	myChart.setOption(option);
}

function getIPData(res) {
	var data = res.data.system;
	var cpu_percent = data.cpu_percent;
	var cpu = cpu_percent * 100;
	var cpuhtml = cpu.toFixed(2);
	var mem_ram_percent = data.mem_ram_percent;
	var mem = mem_ram_percent * 100;
	var menhtml = mem.toFixed(2);
	var disk_busy_percent = data.disk_busy_percent
	if(disk_busy_percent >= 1) {
		disk_busy_percent = 1;
	}
	var disk = disk_busy_percent * 100;
	var diskhtml = disk.toFixed(2);
	$('.version').html('流媒体服务器版本:' + res.data.self.version);
	$('.ftpactive').html('流媒体服务器状态:正常');
	$('.cpu_percent').html(cpuhtml + '%');
	$('.men_percent').html(menhtml + '%')
	$('.disk_busy_percent').html(diskhtml + '%')
	renderCpu(cpu_percent, 1 - cpu_percent);
	renderMemory(mem_ram_percent, 1 - mem_ram_percent);
	renderHardDisk(disk_busy_percent, 1 - disk_busy_percent);
}

function conver(limit) {
	var size = "";
	size = (limit / 1024).toFixed(2) + "KB";
	var sizestr = size + "";
	var len = sizestr.indexOf("\.");
	var dec = sizestr.substr(len + 1, 2);
	if(dec == "00") { //当小数点后为00时 去掉小数部分  
		return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
	}
	return sizestr;
}

function converSpeed(limit) {
	var size = "";
	if(limit < 0.1 * 1024) { //如果小于0.1KB转化成B  
		size = limit.toFixed(2) + "B";
	} else if(limit < 0.1 * 1024 * 1024) { //如果小于0.1MB转化成KB  
		size = (limit / 1024).toFixed(2) + "KB";
	} else if(limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB  
		size = (limit / (1024 * 1024)).toFixed(2) + "MB";
	} else { //其他转化成GB  
		size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
	}

	var sizestr = size + "";
	var len = sizestr.indexOf("\.");
	var dec = sizestr.substr(len + 1, 2);
	if(dec == "00") { //当小数点后为00时 去掉小数部分  
		return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
	}
	return sizestr;
}
//请求ftp数据
function myAjaxftp(url, type, data) {
	var dtd = new $.Deferred();
	$.ajax({
		type: type,
		url: url,
		dataType: 'jsonp',
		processData: false,
		async: true,
		cache: false,
		timeout: 15000,
		success: function(res) {
			if(res.code == '0') {
				dtd.resolve(res)
			} else {
				dtd.reject(res)
			}
		},
		error: function(res) {
			dtd.reject(res)
		}
	});
	return dtd.promise();
}
//画硬盘饼图
function renderHardDisk(use, all) {
	echarts.dispose(document.getElementById('dardDiskChart'));
	var myChart = echarts.init(document.getElementById('dardDiskChart'));
	var option = {
		animation: false,
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
			data: ['硬盘占用'],
			textStyle: { //图例文字的样式
				color: '#333', //文字颜色
				fontSize: 16 //文字大小
			}
		},
		series: [{
			name: '比例',
			type: 'pie',
			center: ['50%', '50%'],
			radius: ['60%', '70%'],
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
					name: '硬盘占用'
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
//画内存饼图
function renderMemory(use, all) {
	echarts.dispose(document.getElementById('memoryChart'));
	var myChart = echarts.init(document.getElementById('memoryChart'));
	var option = {
		animation: false,
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
			radius: ['60%', '70%'],
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
//画CPU饼图
function renderCpu(use, all) {
	echarts.dispose(document.getElementById('cupChart'));
	var myChart = echarts.init(document.getElementById('cupChart'));
	var option = {
		animation: false,
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
			radius: ['60%', '70%'],
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
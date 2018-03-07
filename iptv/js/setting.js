var FTP_PORT = '1985' //ftp端口号
$(function() {
	//浏览器 后退恢复slider
	backSlider('setting', 1);
	$('.webV').html('Web端版本号:&nbsp' + window.iptvVersion);
	var ip = '';
	if(localStorage) {
		ip = localStorage.getItem('ftpIp');

	} else {
		ip = getCookie('ftpIP');
	}
	//本地缓存有ip
	if(ip) {
		var url = 'http://' + ip + ":" + FTP_PORT + '/api/v1/summaries';
		myAjaxftp(url, 'get').then(function(res) {
			var data = res.data.system;
			$('.ftpV').html('流媒体服务器版本:&nbsp' + res.data.self.version);
		})
	} else {
		myAjax('/api/v1/config/serverip', 'get').then(function(res) {
			var ip = res.data;
			var url = 'http://' + ip + ":" + FTP_PORT + '/api/v1/summaries';
			myAjaxftp(url, 'get').then(function(res) {
				var data = res.data.system;
				$('.ftpV').html('流媒体服务器版本:&nbsp' + res.data.self.version);
			})
		})
	}
	
	//日志下载
	$('.downconsole').click(function() {
		var self = $(this);
		var url = '/api/v1/downloadlog';
		self.prop('disabled',true);
		$('.showdown').show();
		myAjax(url, 'get').then(function(res) {
			console.log(res)
			self.prop('disabled',false);
			$('.showdown').hide();
			downloadFile(res.data);
		}, function(res) {
			self.prop('disabled',false);
			console.log(res)
			$('.showdown').hide();
		})
	})
	//清除扫描任务
	$('.clearSacnn').click(function() {
		var url = '/api/v1/programs/clearTask';
		var self = $(this);
		self.prop('disabled',true);
		myAjax(url, 'get').then(function(res) {
			console.log(res)
			self.prop('disabled',false);
			var txt = '扫描任务清除成功';
			window.wxc.xcConfirm(txt, 'success');
		}, function(res) {
			console.log(res)
			self.prop('disabled',false);
			var txt = res.message;
			window.wxc.xcConfirm(txt, 'confirm');
		})
	})
})
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
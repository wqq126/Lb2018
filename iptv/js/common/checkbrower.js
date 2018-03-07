function brower() {
	var broName = 'Runing';
	var str = '';
	var strStart = 0;
	var strStop = 0;
	var arr = new Array();
	var temp = '';
	var userAgent = window.navigator.userAgent; //包含以下属性中所有或一部分的字符串：appCodeName,appName,appVersion,language,platform
	console.log(userAgent)
	if(userAgent.indexOf('Firefox') != -1) {
		isFireFox = true;
		/*broName = 'FireFox浏览器';*/
		strStart = userAgent.indexOf('Firefox');
		temp = userAgent.substring(strStart);
		console.log(temp)
		temp = temp.split('/');
		temp[0] = 'FireFox';
		return temp;
	}
	if(userAgent.indexOf("OPR") > -1) {
		strStart = userAgent.indexOf('OPR');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Opera';
		console.log(temp)
		return temp;

	}
	if(userAgent.indexOf('Edge') != -1) {
		isEdge = true;
		/*broName = 'Edge浏览器';*/
		strStart = userAgent.indexOf('Edge');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Edge';
		console.log(temp)
		return temp;
	}

	//Chrome浏览器
	if(userAgent.indexOf('Chrome') > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("OPR") < 0) {
		isChrome = true;
		/*broName = 'Chrome浏览器';*/
		var is360 = false;
		var option = 'type';
		var value = 'application/vnd.chromium.remoting-viewer';
		var mimeTypes = navigator.mimeTypes;

		for(var mt in mimeTypes) {
			if(mimeTypes[mt][option] == value) {
				console.log('360')
				is360 = true;
			}
		}
		strStart = userAgent.indexOf('Chrome');
		strStop = userAgent.indexOf(' Safari');
		temp = userAgent.substring(strStart, strStop);
		temp = temp.split('/');
		if(is360) {
			temp[0] = '360';
		} else {
			temp[0] = 'Chrome';
		}
		return temp;
	}

	//ie11以下
	if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
		var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
		reIE.test(userAgent);
		var fIEVersion = parseFloat(RegExp["$1"]);
		console.log(fIEVersion)
		temp=['IE',fIEVersion];
		return temp;
	}
	//ie11
	if(userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1) {
		temp=['IE',11];
		return temp;
	}
	if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1) {
		strStart = userAgent.indexOf('Safari');
		temp = userAgent.substring(strStart);
		temp = temp.split('/');
		temp[0] = 'Safari';
		return temp;
	}

}
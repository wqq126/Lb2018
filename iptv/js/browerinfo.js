window.onload = function() {
	var browerResult = brower();
	var browerName = browerResult[0];
	var browerV = browerResult[1];
	if(isNaN(browerV)) {
		browerV = browerV.split('.')[0];
	}
	console.log(browerResult)
	switch(browerName) {
		case 'IE':
			if(browerV > 9) {
				window.location.href = 'login.html';
			}
			break;
		case 'Chrome':
			if(browerV > 30) {
				window.location.href = 'login.html';
			}
			break;
		case 'Edge':
			if(browerV > 12) {
				window.location.href = 'login.html';
			}
			break;
		case 'FireFox':
			if(browerV > 47) {
				window.location.href = 'login.html';
			}
			break;
		case 'Opera':
			if(browerV > 39) {
				window.location.href = 'login.html';
			}
			break;
		case 'Safari':
			if(browerV > 10) {
				window.location.href = 'login.html';
			}
			break;
		default:
			window.location.href = 'login.html';
			break;
	}
}
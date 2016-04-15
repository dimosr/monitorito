function ChromeEventSource() {
	EventSource.call(this);
}

ChromeEventSource.prototype = new EventSource();

ChromeEventSource.prototype.buildHttpRequest = function(customRequest) {
	if(	customRequest.method == "POST" && 
		customRequest.requestBody !== undefined && 
		customRequest.requestBody.formData !== undefined) {
		var bodyParams = customRequest.requestBody.formData;
	}
	else {
		var bodyParams = {};
	}
	var type = customRequest.type == "main_frame" ? HttpRequest.Type.ROOT : HttpRequest.Type.EMBEDDED;
	return new HttpRequest(customRequest.method, customRequest.url, customRequest.timeStamp, bodyParams, type);
}

ChromeEventSource.prototype.buildRedirect = function(customRequest) {
	var type = customRequest.type == "main_frame" ? HttpRequest.Type.ROOT : HttpRequest.Type.EMBEDDED;
	return new Redirect(customRequest.url, customRequest.redirectUrl, type);
}
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
	return new HttpRequest(customRequest.method, customRequest.url, customRequest.timestamp, bodyParams);
}
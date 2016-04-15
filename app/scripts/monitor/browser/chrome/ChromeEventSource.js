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

ChromeEventSource.prototype.collectRequests = function() {
	var eventSource = this;
	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			var httpRequest = eventSource.buildHttpRequest(details);
			eventSource.notifyForRequest(httpRequest, details.tabId);
		},
		{urls: ["<all_urls>"]},
		['requestBody']
	);
}

ChromeEventSource.prototype.collectRedirects = function() {
	var eventSource = this;
	chrome.webRequest.onBeforeRedirect.addListener(
		function(details) {
			var redirect = eventSource.buildRedirect(details);
			eventSource.notifyForRedirect(redirect);
		},
		{urls: ["<all_urls>"]}
	);
}
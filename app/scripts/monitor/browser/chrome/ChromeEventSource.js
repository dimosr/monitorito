"use strict";

function ChromeEventSource(browserAPI) {
	this.browserAPI = browserAPI;

	EventSource.call(this);
}

ChromeEventSource.prototype = Object.create(EventSource.prototype);

ChromeEventSource.prototype.buildHttpRequest = function(customRequest) {
	if(	customRequest.method == "POST" && 
		customRequest.requestBody !== undefined && 
		customRequest.requestBody.formData !== undefined) {
		var bodyParams = customRequest.requestBody.formData;
	}
	else {
		var bodyParams = {};
	}
	var requestType = customRequest.type == "main_frame" ? HttpRequest.Type.ROOT : HttpRequest.Type.EMBEDDED;
	return new HttpRequest(customRequest.requestId, customRequest.method, customRequest.url, customRequest.timeStamp, bodyParams, requestType, customRequest.type);
}

ChromeEventSource.prototype.buildRedirect = function(customRequest) {
	var type = customRequest.type == "main_frame" ? HttpRequest.Type.ROOT : HttpRequest.Type.EMBEDDED;
	return new Redirect(customRequest.url, customRequest.redirectUrl, type, customRequest.timeStamp);
}

ChromeEventSource.prototype.buildHeaders = function(headers) {
	var map = {};
	for(var i = 0; i < headers.length; i++) {
		map[headers[i].name] = headers[i].value;
	}
	return map;
}

ChromeEventSource.prototype.collectRequests = function() {
	var eventSource = this;
	this.browserAPI.webRequest.onBeforeRequest.addListener(
		function(details) {
			var httpRequest = eventSource.buildHttpRequest(details);
			eventSource.notifyForRequest(details.requestId, httpRequest, details.tabId);
		},
		{urls: ["<all_urls>"]},
		['requestBody']
	);
}

ChromeEventSource.prototype.collectHeaders = function() {
	var eventSource = this;
	this.browserAPI.webRequest.onSendHeaders.addListener(
		function(details) {
			var headersMap = eventSource.buildHeaders(details.requestHeaders);
			eventSource.notifyForHeaders(details.requestId, headersMap);
		},
		{urls: ["<all_urls>"]},
		['requestHeaders']
	);
}

ChromeEventSource.prototype.collectRedirects = function() {
	var eventSource = this;
	this.browserAPI.webRequest.onBeforeRedirect.addListener(
		function(details) {
			var redirect = eventSource.buildRedirect(details);
			eventSource.notifyForRedirect(details.requestId, redirect);
		},
		{urls: ["<all_urls>"]}
	);
}

ChromeEventSource.prototype.collectRequestCompletions = function() {
	var eventSource = this;
	this.browserAPI.webRequest.onCompleted.addListener(
		function(details) {
			eventSource.notifyForRequestComplete(details.requestId);
		},
		{urls: ["<all_urls>"]}
	);
}

ChromeEventSource.prototype.collectRequestErrors = function() {
	var eventSource = this;
	this.browserAPI.webRequest.onErrorOccurred.addListener(
		function(details) {
			eventSource.notifyForRequestError(details.requestId, details.error);
		},
		{urls: ["<all_urls>"]}
	);
}
"use strict";

function HttpRequest(method, url, timestamp, bodyParams, type) {
	this.method = method;
	this.url = url;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;
	this.type = type;
	this.headers = {};
}

HttpRequest.prototype.setHeaders = function(headers) {
	this.headers = headers;
}

HttpRequest.Type = {
	ROOT: "Root",
	EMBEDDED: "Embedded"
}
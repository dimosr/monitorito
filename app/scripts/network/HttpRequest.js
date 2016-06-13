"use strict";

function HttpRequest(method, url, timestamp, bodyParams, type) {
	this.method = method;
	this.url = url;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;
	this.type = type;
	this.headers = {};

	this._referer = null;
}

HttpRequest.prototype.setHeaders = function(headers) {
	this.headers = headers;
	if("Referer" in headers) this._referer = headers["Referer"];
}

HttpRequest.prototype.hasReferer = function() {
	return this._referer != null;
}

HttpRequest.prototype.getReferer = function() {
	return this._referer;
}

HttpRequest.Type = {
	ROOT: "Root",
	EMBEDDED: "Embedded"
}
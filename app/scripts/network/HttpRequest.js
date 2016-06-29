"use strict";

function HttpRequest(ID, method, url, timestamp, bodyParams, type, resourceType) {
	this.ID = ID;
	this.method = method;
	this.url = url;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;
	this.type = type;
	this.resourceType = resourceType;
	this.headers = {};
	this.cookies = {};

	this._referer = null;
}

HttpRequest.prototype.setHeaders = function(headers) {
	this.headers = headers;
	if("Referer" in headers) this._referer = headers["Referer"];
	if("Cookie" in headers) this.cookies = Util.getCookiesMap(headers["Cookie"]);
}

HttpRequest.prototype.getHeaders = function() {
	return this.headers;
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
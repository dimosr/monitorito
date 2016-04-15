"use strict";

function HttpRequest(method, url, timestamp, bodyParams, type) {
	this.method = method;
	this.url = url;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;
	this.type = type;
}

HttpRequest.Type = {
	ROOT: "Root",
	EMBEDDED: "Embedded"
}

HttpRequest.prototype.getHostname = function() {
	var uri = new URI(this.url);
	return uri.hostname();
};
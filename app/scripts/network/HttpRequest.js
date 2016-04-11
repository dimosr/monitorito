function HttpRequest(method, type, url, timestamp, bodyParams) {
	this.method = method;
	this.type = type;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;

	this._url = new URI(url);
}

HttpRequest.prototype.getHostname = function() {
	return this._url.hostname();
};

HttpRequest.prototype.getUrl = function() {
	return this._url.toString();
};
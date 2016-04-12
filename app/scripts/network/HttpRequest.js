function HttpRequest(method, url, timestamp, bodyParams) {
	this.method = method;
	this.url = url;
	this.timestamp = timestamp;
	this.bodyParams = bodyParams;

	this._redirectedTo = null;
}

HttpRequest.prototype.getHostname = function() {
	var uri = new URI(this.url);
	return uri.hostname();
};

HttpRequest.prototype.wasRedirected = function() {
	this._redirectedTo == null;
}

HttpRequest.prototype.redirectTo = function(newURL) {
	this._redirectedTo = newURL;
}

HttpRequest.prototype.getRedirectUrl = function() {
	return this._redirectedTo;
}
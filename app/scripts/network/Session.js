function Session(rootRequest) {

	this._embeddedRequests = [];
	this._rootRequest = rootRequest;
}

Session.prototype.addEmbeddedRequest = function(request) {
	this._embeddedRequests.push(request);
}

Session.prototype.getRootRequest = function() {
	return this._rootRequest;
}

Session.prototype.getEmbeddedRequests = function() {
	return this._embeddedRequests;
}

Session.prototype.addRedirect = function(oldURL, newURL) {
	if(this._rootRequest.url == oldURL)	this._rootRequest.redirectTo(newURL);
	else {
		for(var i = 0; i < this._embeddedRequests.length; i++) {
			if(this._embeddedRequests[i].url == oldURL) this._embeddedRequests[i].redirectTo(newURL);
		}
	}
}
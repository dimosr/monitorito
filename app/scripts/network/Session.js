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
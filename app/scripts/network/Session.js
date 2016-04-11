function Session(rootRequest) {

	this._embeddedRequests = [];
	this._rootRequest = rootRequest;
}

Session.prototype.addEmbeddedRequest = function(request) {
	this._embeddedRequests.push(request);
}
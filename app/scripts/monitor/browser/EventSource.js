function EventSource() {
	this._observers = [];
}

EventSource.prototype.register = function(observer) {
	this._observers.push(observer);
}

EventSource.prototype.notifyForRequest = function(request, isRoot, tabID) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequest(request, isRoot, tabID);
	}
}

EventSource.prototype.notifyForRedirect = function(redirect) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRedirect(redirect);
	}
}
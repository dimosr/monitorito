function ChromeEventSource() {
	this._observers = [];
}

ChromeEventSource.prototype.register = function(observer) {
	this._observers.push(observer);
}

ChromeEventSource.prototype.notifyForRequest = function(request) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequest(request);
	}
}

ChromeEventSource.prototype.notifyForRedirect = function(request) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRedirect(request);
	}
}
"use strict";

function EventSource() {
	this._observers = [];
}

EventSource.prototype.register = function(observer) {
	this._observers.push(observer);
}

EventSource.prototype.notifyForRequest = function(requestID, request, tabID) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequest(requestID, request, tabID);
	}
}

EventSource.prototype.notifyForHeaders = function(requestID, headers) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequestHeaders(requestID, headers);
	}
}

EventSource.prototype.notifyForRedirect = function(requestID, redirect) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRedirect(requestID, redirect);
	}
}

EventSource.prototype.notifyForRequestComplete = function(requestID) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequestCompleted(requestID);
	}
}

EventSource.prototype.notifyForRequestError = function(requestID) {
	for(var i = 0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onRequestError(requestID);
	}
}
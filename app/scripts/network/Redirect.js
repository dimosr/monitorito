"use strict";

function Redirect(fromURL, toURL, requestType, timestamp) {
	this._from = fromURL;
	this._to = toURL;
	this.type = requestType;
	this.timestamp = timestamp;
}

Redirect.prototype.getInitialURL = function() {
	return this._from;
}

Redirect.prototype.getFinalURL = function() {
	return this._to;
}
function Redirect(fromURL, toURL, type) {
	this._from = fromURL;
	this._to = toURL;
	this.type = type;
}

Redirect.prototype.getInitialURL = function() {
	return this._from;
}

Redirect.prototype.getFinalURL = function() {
	return this._to;
}
"use strict";

function Node(ID) {
	this.id = ID;
}

Node.prototype.getID = function() {
	return this.id;
}

Node.prototype.getFaviconURL = function(domain) {
	return "http://www.google.com/s2/favicons?domain=" + domain;
}
"use strict";

function Edge(ID, type, fromNode, toNode) {
	this._type = type;
	this._from = fromNode;
	this._to = toNode;
	this._links = [];

	this._vizEdge = Edge.buildVizEdge(ID, type, fromNode, toNode);
}

Edge.Type = {
	REQUEST: {name: "Request", dashes: false},
	REDIRECT: {name: "Redirect", dashes: true},
}

Edge.prototype.addRequest = function(fromURL, toURL) {
	this._links.push({from: fromURL, to: toURL});
}

Edge.prototype.getRequests = function() {
	return this._links;
}

Edge.prototype.getSourceNode = function() {
	return this._from;
}

Edge.prototype.getDestinationNode = function() {
	return this._to;
}

Edge.prototype.getType = function() {
	return this._type;
}

Edge.prototype.getVizEdge = function() {
	return this._vizEdge
}

Edge.buildVizEdge = function(ID, type, fromNode, toNode){
	return {
		id: ID,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNode.getID(),
		to: toNode.getID(),
		width: 3,
		dashes: type.dashes
	}
}
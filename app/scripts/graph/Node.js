"use strict";

function Node(ID, type, domain) {
	this._type = type;
	this._outgoing = {};
	this._incoming = {};
	this._requests = [];

	var size = type == HttpRequest.Type.ROOT ? 40 : 20;
	this._vizNode = Node.buildVizNode(ID, size, domain);
}

Node.prototype.getType = function() {
	return this._type;
}

Node.prototype.getID = function() {
	return this._vizNode.id;
}

Node.prototype.getDomain = function() {
	return this._vizNode.title;
}

Node.prototype.addRequest = function(HttpRequest) {
	this._requests.push(HttpRequest);
}

Node.prototype.getRequests = function() {
	return this._requests;
}

Node.prototype.addEdgeTo = function(destinationNode, edge) {
	this._outgoing[destinationNode.getDomain()] = {'edge': edge};
}

Node.prototype.getEdgeTo = function(destinationNode) {
	return this._outgoing[destinationNode.getDomain()].edge;
}

Node.prototype.hasEdgeTo = function(destinationNode) {
	return destinationNode.getDomain() in this._outgoing;
}



Node.prototype.addEdgeFrom = function(sourceNode, edge) {
	this._incoming[sourceNode.getDomain()] = {'edge': edge};
}

Node.prototype.getEdgeFrom = function(sourceNode) {
	return this._incoming[sourceNode.getDomain()].edge;
}

Node.prototype.hasEdgeFrom = function(sourceNode) {
	return sourceNode.getDomain() in this._incoming;
}

Node.buildVizNode = function(ID, size, domain) {
	return {
		id: ID, 
		shape: 'circularImage', 
		size: size, 
		image: Node.getFaviconURL(domain),
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: domain
	}
}

Node.prototype.getVizNode = function() {
	return this._vizNode;
}

Node.getFaviconURL = function(domain) {
	return "http://www.google.com/s2/favicons?domain=" + domain;
}

Node.prototype.getEdges = function() {
	var edges = [];
	for(var hostnameKey in this._outgoing) edges.push(this._outgoing[hostnameKey].edge);
	return edges;
}
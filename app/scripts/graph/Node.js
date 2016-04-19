"use strict";

function Node(ID, type, domain) {
	this._type = type;
	this._adjacent = {};
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

Node.prototype.addEdgeTo = function(adjNode, edge) {
	this._adjacent[adjNode.getDomain()] = {'edge': edge};
}

Node.prototype.getEdgeTo = function(adjNode) {
	return this._adjacent[adjNode.getDomain()].edge;
}

Node.prototype.hasEdgeTo = function(adjNode) {
	return adjNode.getDomain() in this._adjacent;
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
	for(var hostnameKey in this._adjacent) edges.push(this._adjacent[hostnameKey].edge);
	return edges;
}
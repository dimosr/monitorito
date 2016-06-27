"use strict";

function Node(id, graph, networkNodes) {
	this.id = id;
	this.type = Node.Type.default;

	this._outgoing = {};
	this._incoming = {};
	this._requests = [];
	this.networkNodes = networkNodes;

	this.cookies = {};
	this.cookies[HttpRequest.Type.ROOT] = {};
	this.cookies[HttpRequest.Type.EMBEDDED] = {};

	if(graph.mode == Graph.Mode.ONLINE) this.createVisualNode();
	this.graph = graph;
}

Node.Type = {};
Node.Type["default"] = {name: "Default", rank: 3, size: 20};
Node.Type[HttpRequest.Type.ROOT] = {name: "First Party", rank: 1, size: 40},
Node.Type[HttpRequest.Type.EMBEDDED] = {name: "Third Party", rank: 2, size: 20}

Node.prototype.getID = function() {
	return this.id;
}

Node.prototype.getDomain = function() {
	return this.id;
}

Node.prototype.addRequest = function(httpRequest) {
	this._requests.push(httpRequest);
	for(var key in httpRequest.cookies) {
		this.cookies[httpRequest.type][key] = httpRequest.cookies[key];
	}
	if(this.type.rank > Node.Type[httpRequest.type].rank) this.updateType(Node.Type[httpRequest.type]);
}

Node.prototype.getRequests = function() {
	return this._requests;
}

Node.prototype.getFirstPartyCookies = function() {
	return this.cookies[HttpRequest.Type.ROOT];
}

Node.prototype.getThirdPartyCookies = function() {
	return this.cookies[HttpRequest.Type.EMBEDDED];
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

Node.prototype.createVisualNode = function() {
	this.networkNodes.add({
		id: this.id, 
		shape: 'circularImage', 
		size: this.type.size, 
		image: Node.getFaviconURL(this.id),
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: this.id
	});
}

Node.prototype.updateVisualNodeType = function(type) {
	this.networkNodes.update({
		id: this.id,  
		size: this.type.size
	});
}

Node.prototype.updateType = function(type) {
	var previousType = this.type, newType = type;

	this.type = newType;
	if(this.graph.mode == Graph.Mode.ONLINE) this.updateVisualNodeType(type);

	this.notifyForChange(previousType, newType, this);
}

Node.getFaviconURL = function(domain) {
	return "http://www.google.com/s2/favicons?domain=" + domain;
}

Node.prototype.getOutgoingEdges = function() {
	var edges = [];
	for(var hostnameKey in this._outgoing) edges.push(this._outgoing[hostnameKey].edge);
	return edges;
}

Node.prototype.getIncomingEdges = function() {
	var edges = [];
	for(var hostnameKey in this._incoming) edges.push(this._incoming[hostnameKey].edge);
	return edges;
}

Node.prototype.getFirstPartyCookies = function() {
	return this.cookies[HttpRequest.Type.ROOT];
}

Node.prototype.getThirdPartyCookies = function() {
	return this.cookies[HttpRequest.Type.EMBEDDED];
}

Node.prototype.notifyForChange = function(fromType, toType, node) {
	this.graph.notifyForNodeChange(fromType, toType, node);
}
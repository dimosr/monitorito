"use strict";

function Edge(id, fromNode, toNode, graph, networkEdges) {
	this.id = id.toString();
	this.type = Edge.Type.DEFAULT;

	
	this._from = fromNode;
	this._to = toNode;
	this._links = {
		"requests": [],
		"redirects": [],
		"referrals": []
	};
	this.networkEdges = networkEdges;

	if(graph.mode == Graph.Mode.ONLINE) this.createVisualEdge();
	this.graph = graph;
	fromNode.addEdgeTo(toNode, this);
	toNode.addEdgeFrom(fromNode, this);
}

Edge.Type = {
	DEFAULT: {name: "Default", rank: 4,dashes: false, color: "grey"},
	REQUEST: {name: "Request", rank: 2,dashes: false, color: "grey"},
	REDIRECT: {name: "Redirect", rank: 3,dashes: true, color: "grey"},
	REFERRAL: {name: "Referral", rank: 1,dashes: false, color: "red"}
}

Edge.prototype.addRequest = function(fromURL, request) {
	this._links.requests.push({from: fromURL, request: request});
	if(this.type.rank > Edge.Type.REQUEST.rank) this.updateType(Edge.Type.REQUEST);
}

Edge.prototype.getRequests = function() {
	return this._links.requests;
}

Edge.prototype.addRedirect = function(redirect) {
	this._links.redirects.push(redirect);
	if(this.type.rank > Edge.Type.REDIRECT.rank) this.updateType(Edge.Type.REDIRECT);
}

Edge.prototype.getRedirects = function() {
	return this._links.redirects;
}

Edge.prototype.addReferral = function(fromURL, request) {
	this._links.referrals.push({from: fromURL, request: request});
	if(this.type.rank > Edge.Type.REFERRAL.rank) this.updateType(Edge.Type.REFERRAL);
}

Edge.prototype.getReferrals = function() {
	return this._links.referrals;
}

Edge.prototype.getSourceNode = function() {
	return this._from;
}

Edge.prototype.getDestinationNode = function() {
	return this._to;
}

Edge.prototype.getType = function() {
	return this.type;
}

Edge.prototype.createVisualEdge = function(){
	this.networkEdges.add({
		id: this.id.toString(),
		arrows: {
			to: {scaleFactor: 1}
		},
		from: this._from.getID(),
		to: this._to.getID(),
		width: 3,
		dashes: this.type.dashes,
		color: this.type.color
	});
}

Edge.prototype.updateVisualEdgeType = function(type) {
	this.networkEdges.update({
		id: this.id.toString(),
		dashes: this.type.dashes,
		color: this.type.color
	});
}

Edge.prototype.updateType = function(type) {
	var previousType = this.type, newType = type;

	this.type = newType;
	if(this.graph.mode == Graph.Mode.ONLINE) this.updateVisualEdgeType(type);
	
	this.notifyForChange(previousType, newType, this);
}

Edge.prototype.notifyForChange = function(fromType, toType, edge) {
	this.graph.notifyForEdgeChange(fromType, toType, edge);
}

Edge.groupEdgesByType = function(edges) {
	var groupedEdges = {};
	for(var key in Edge.Type) {
		var type = Edge.Type[key];
		groupedEdges[type.name] = [];
	}
	for(var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		groupedEdges[edge.getType().name].push(edge);
	}
	return groupedEdges;
}
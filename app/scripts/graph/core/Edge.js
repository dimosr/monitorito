"use strict";

function Edge(id, fromNode, toNode, graph, networkEdges) {
	this.id = id.toString();
	
	this._from = fromNode;
	this._to = toNode;
	this.networkEdges = networkEdges;
	this.graph = graph;
	fromNode.addEdgeTo(toNode, this);
	toNode.addEdgeFrom(fromNode, this);
}

Edge.prototype.getID = function() {
	return this.id;
}

Edge.prototype.getSourceNode = function() {
	return this._from;
}

Edge.prototype.getDestinationNode = function() {
	return this._to;
}

Edge.prototype.createVisualEdge = function(options){
	if(this.graph.mode == Graph.Mode.ONLINE)
		this.networkEdges.add(options);
}

Edge.prototype.updateVisualEdgeType = function(options) {
	if(this.graph.mode == Graph.Mode.ONLINE)
		this.networkEdges.update(options);
}

Edge.prototype.notifyForChange = function(fromType, toType) {
	this.graph.notifyForEdgeChange(fromType, toType, this);
}
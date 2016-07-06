"use strict";

function Edge(id, fromNode, toNode, graph, networkEdges) {
	this.id = id.toString();
	
	this._from = fromNode;
	this._to = toNode;
	this.networkEdges = networkEdges;
	this.graph = graph;
	fromNode.addEdgeTo(toNode, this);
	toNode.addEdgeFrom(fromNode, this);

	this.visible = true;
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
	if(this.graph.mode == Graph.Mode.ONLINE) {
		options.id = this.id;
		options.from = this._from.getID();
		options.to = this._to.getID();
		this.networkEdges.add(options);
		if(!this._from.visible || !this._to.visible) this.hide();
	}
}

Edge.prototype.updateVisualEdge = function(options) {
	if(this.graph.mode == Graph.Mode.ONLINE) {
		options.id = this.id;
		this.networkEdges.update(options);
	}
}

Edge.prototype.notifyForChange = function(fromType, toType) {
	this.graph.notifyForEdgeChange(fromType, toType, this);
}

Edge.prototype.remove = function() {
	this.getSourceNode().removeEdgeTo(this.getDestinationNode());
	this.getDestinationNode().removeEdgeFrom(this.getSourceNode());
	this.networkEdges.remove(this.getID());
}

Node.prototype.hide = function() {
	if(this.visible) {
		this.networkEdges.update({id: this.id, hidden: true});
		this.visible = false;
	}
}

Node.prototype.show = function() {
	if(!this.visible) {
		this.networkEdges.update({id: this.id, hidden: false});
		this.visible = true;
	}
}
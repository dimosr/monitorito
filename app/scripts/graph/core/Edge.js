"use strict";

function Edge(id, fromNode, toNode, graph, networkEdges) {
	this.id = id.toString();
	
	this._from = fromNode;
	this._to = toNode;
	this.networkEdges = networkEdges;
	this.graph = graph;
	fromNode.addEdgeTo(toNode, this);
	toNode.addEdgeFrom(fromNode, this);

	if(fromNode.isVisible() && toNode.isVisible()) this.visible = true;
	this.locked = false;
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
		options.hidden = !this.visible;
		options.physics = this.visible;
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
	if(this.graph.mode == Graph.Mode.ONLINE) this.networkEdges.remove(this.getID());
}

Edge.prototype.hide = function() {
	if(this.visible && !this.locked) {
		this.networkEdges.update({id: this.id, hidden: true, physics: false});
		this.visible = false;
	}
}

Edge.prototype.show = function() {
	if(!this.visible && !this.locked) {
		this.networkEdges.update({id: this.id, hidden: false, physics: true});
		this.visible = true;
	}
}

/*	@Docs
	Shows the edge, only if both nodes are visible
 */
Edge.prototype.checkAndShow = function() {
	if(this.getDestinationNode().isVisible() & this.getSourceNode().isVisible()) this.show();
}

/* 	@Docs
	Locks an edge.
	show(),hide() have no effect on it.
 */
Edge.prototype.lock = function() {
	if(!this.locked) this.locked = true;
}

/* 	@Docs
 	Unlocks an edge.
 	show(),hide() have now effect on it.
 */
Edge.prototype.unlock = function() {
	if(this.locked) this.locked = false;
}

Edge.prototype.isVisible = function() {
	return this.visible;
}
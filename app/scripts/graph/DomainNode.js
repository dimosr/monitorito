"use strict";

DomainNode.prototype = Object.create(Node.prototype);
DomainNode.prototype.constructor = DomainNode;

function DomainNode(ID) {
	Node.call(this, ID);

	this.inEdges = {};
	this.inEdges[Edge.Type.DOMAIN.name] = {};
}

DomainNode.prototype.getVisSettings = function() {
	return {
		id: this.getID(),
		shape: 'circularImage', 
		size: 40, 
		borderWidth: 5,
		image : this.getFaviconURL(this.getID()),
		'color': 'blue',
		title: this.getID(),
	};
}

DomainNode.prototype.addInEdge = function(resourceNode, edgeID) {
	this.inEdges[Edge.Type.DOMAIN.name][resourceNode.getID()] = edgeID;
}

DomainNode.prototype.getInEdges = function() {
	var IDs = [];
	for(var nodeID in this.inEdges[Edge.Type.DOMAIN.name]) IDs.push(nodeID);
	return IDs;
}
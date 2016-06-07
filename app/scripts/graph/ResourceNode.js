"use strict";

ResourceNode.prototype = Object.create(Node.prototype);
ResourceNode.prototype.constructor = Node;

function ResourceNode(ID) {
	Node.call(this, ID);

	this.requests = [];
	this.inEdges = {};
	this.inEdges[Edge.Type.REQUEST.name] = {};
	this.inEdges[Edge.Type.REFERRAL.name] = {};
	this.inEdges[Edge.Type.REDIRECT.name] = {};

	this.outEdges = {};
	this.outEdges[Edge.Type.REQUEST.name] = {};
	this.outEdges[Edge.Type.REFERRAL.name] = {};
	this.outEdges[Edge.Type.REDIRECT.name] = {};
	this.outEdges[Edge.Type.DOMAIN.name] = {};
}

ResourceNode.prototype.getVisSettings = function() {
	return {
		id: this.getID(),
		shape: 'circle', 
		size: 30, 
		borderWidth: 5,
		color: 'grey',
		title: this.getID()
	};
}

ResourceNode.prototype.addRequest = function(request) {
	this.requests.push(request);
}

ResourceNode.prototype.setDomainNode = function(node) {
	this.domainNode = node;
}

ResourceNode.prototype.getDomainNode = function() {
	return this.domainNode;
}

ResourceNode.prototype.addInEdge = function(sourceResource, edgeType, edgeID) {
	this.inEdges[edgeType.name][sourceResource.getID()] = edgeID;
}

ResourceNode.prototype.removeInEdge = function(sourceResource, edgeType) {
	var id = this.inEdges[edgeType.name][sourceResource.getID()];
	delete this.inEdges[edgeType.name][sourceResource.getID()];
	return id;
}

ResourceNode.prototype.getInEdges = function(edgeType) {
	var IDs = [];
	for(var nodeID in this.inEdges[edgeType.name]) IDs.push({"toNode": nodeID, "edgeID": this.inEdges[nodeID]});
	return IDs;
}

ResourceNode.prototype.addOutEdge = function(destinationResource, edgeType, edgeID) {
	this.outEdges[edgeType.name][destinationResource.getID()] = edgeID;
}

ResourceNode.prototype.removeOutEdge = function(destinationResource, edgeType) {
	var id = this.outEdges[edgeType.name][destinationResource.getID()];
	delete this.outEdges[edgeType.name][destinationResource.getID()];
	return id;
}

ResourceNode.prototype.getOutEdges = function(edgeType) {
	var edges = [];
	for(var nodeID in this.outEdges[edgeType.name]) IDs.push({"toNode": nodeID, "edgeID": this.outEdges[nodeID]});
	return IDs;
}

ResourceNode.prototype.getEdgeTo = function(toNode, edgeType) {
	return this.outEdges[edgeType.name][toNode.getID()];
}
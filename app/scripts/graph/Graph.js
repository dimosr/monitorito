"use strict";

function Graph(visualisationNetwork) {
	this._edgesAutoIncrement = 1;
	this._observers = [];

	this.nodes = {};
	this.edges = {};

	if(visualisationNetwork != null) {
		this.visualisationNetwork = visualisationNetwork;
		this.visualisationNetwork.setupListeners(this);
		this.mode = Graph.Mode.ONLINE;
	}
	else this.mode = Graph.Mode.OFFLINE;
}

Graph.Mode = {
	ONLINE: "Online",
	OFFLINE: "Offline"
}

Graph.prototype.setClusteringEngine = function(clusteringEngine) {
	this.clusteringEngine = clusteringEngine;
}

Graph.prototype.disablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("disablePhysics() called for graph without visualisation");
	else this.visualisationNetwork.disablePhysics();
}

Graph.prototype.enablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("enablePhysics() called for graph without visualisation");
	else this.visualisationNetwork.enablePhysics();
}

Graph.prototype.addListeners = function(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn) {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("addListeners() called for graph without visualisation");
	else this.visualisationNetwork.addListeners(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn);
}

Graph.prototype.createCluster = function(options) {
	this.visualisationNetwork.createCluster(options);
}

Graph.prototype.openCluster = function(clusterID) {
	this.visualisationNetwork.openCluster(clusterID);
}

Graph.prototype.triggerDeselectNode = function(node) {
	this.visualisationNetwork.triggerDeselectNode(node);
}

Graph.prototype.register = function(observer) {
	this._observers.push(observer);
}

Graph.prototype.notifyForNewNode = function(node) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNewNode(node);
}

Graph.prototype.notifyForNodeChange = function(fromType, toType, node) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNodeChange(fromType, toType, node);
}

Graph.prototype.notifyForNewEdge = function(edge) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNewEdge(edge);
}

Graph.prototype.notifyForEdgeChange = function(fromType, toType, edge) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onEdgeChange(fromType, toType, edge);
}

Graph.prototype.createDomainEdge = function(fromHostname, toHostname) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	var edge = new DomainEdge(this._edgesAutoIncrement++, fromNode, toNode, this, this.mode == Graph.Mode.ONLINE ? this.visualisationNetwork.getEdgesDataset() : null);
	this.edges[edge.getID()] = edge;
	this.notifyForNewEdge(edge);
	return edge;
}

Graph.prototype.getDomainEdges = function() {
	var edges = [];
	for(var key in this.edges) {
		if(this.edges[key] instanceof DomainEdge) edges.push(this.edges[key]);
	}
	return edges;
}

Graph.prototype.getEdgeBetweenNodes = function(fromNodeID, toNodeID) {
	var fromNode = this.getNode(fromNodeID);
	var toNode = this.getNode(toNodeID);
	return fromNode.hasEdgeTo(toNode) ? fromNode.getEdgeTo(toNode) : null;
}

Graph.prototype.getEdge = function(ID) {
	return (ID in this.edges) ? this.edges[ID] : null;
}

Graph.prototype.existsEdge = function(fromNodeID, toNodeID) {
	return this.getEdgeBetweenNodes(fromNodeID, toNodeID) != null;
}

Graph.prototype.createDomainNode = function(hostname) {
	var node = new DomainNode(hostname, this, this.mode == Graph.Mode.ONLINE ? this.visualisationNetwork.getNodesDataset() : null);
	this.nodes[hostname] = node;
	this.notifyForNewNode(node);
	return node;
}

Graph.prototype.getDomainNodes = function() {
	var nodes = [];
	for(var key in this.nodes) {
		if(this.nodes[key] instanceof DomainNode) nodes.push(this.nodes[key]);
	}
	return nodes;
}

Graph.prototype.getNode = function(ID) {
	return (ID in this.nodes) ? this.nodes[ID] : null;
}

Graph.prototype.existsNode = function(ID) {
	return ID in this.nodes;
}

/* No need to notify GraphStatsCalculator for ResourceNodes, ResourceEdges */

Graph.prototype.createResourceEdge = function(fromNodeID, toNodeID) {
	var fromNode = this.getNode(fromNodeID);
	var toNode = this.getNode(toNodeID);
	var edge = new ResourceEdge("resourceEdge-" + this._edgesAutoIncrement++, fromNode, toNode, this, this.mode == Graph.Mode.ONLINE ? this.visualisationNetwork.getEdgesDataset() : null);
	this.edges[edge.getID()] = edge;
}

Graph.prototype.createResourceNode = function(resourceURL) {
	var node = new ResourceNode(resourceURL, this, this.visualisationNetwork.getNodesDataset(), this.visualisationNetwork.getEdgesDataset(), this.nodes[Util.getUrlHostname(resourceURL)], this._edgesAutoIncrement++);
	this.nodes[resourceURL] = node;
}

Graph.prototype.deleteResourceNode = function(nodeID) {
	var node = this.nodes[nodeID];
	if(!(node instanceof ResourceNode)) throw new Error("Only Resource Nodes can be deleted");
	delete this.nodes[nodeID];
	node.remove();
}

Graph.prototype.deleteResourceEdge = function(edgeID) {
	var edge = this.edges[edgeID];
	if(!(edge instanceof ResourceEdge)) throw new Error("Only Resource Edges can be deleted");
	delete this.edges[edgeID];
	edge.remove();
}
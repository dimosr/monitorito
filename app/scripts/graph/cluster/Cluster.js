"use strict";

function Cluster(id, graph, containedNodes) {
	this.id = id;
	this.graph = graph;

	this.nodes = {};
	for(var i = 0; i < containedNodes.length; i++) 
		this.nodes[containedNodes[i].getID()] = containedNodes[i];

	this.createVisualCluster();
}

Cluster.prototype.createVisualCluster = function() {
	var nodes = this.nodes;
	var joinCondition = function(nodeOptions) {
		return nodeOptions.id in nodes; 
	};
	var options = {
		joinCondition: joinCondition,
		clusterNodeProperties: {
			id: this.id,
			title: this.id,
			label: this.id,
			shape: "database"
		}
	};

	this.graph._network.cluster(options);
}

Cluster.prototype.delete = function() {
	this.graph._network.openCluster(this.id);
}

Cluster.prototype.getNodes = function() {
	var nodes = [];
	for(var key in this.nodes) nodes.push(nodes[key]);
	return nodes;
}
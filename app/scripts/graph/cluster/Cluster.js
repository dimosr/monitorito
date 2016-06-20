"use strict";

function Cluster(id, graph, containedNodes) {
	this.id = id;
	this.graph = graph;

	this.nodes = {};
	this._outgoing = {};
	this._incoming = {};

	for(var i = 0; i < containedNodes.length; i++) 
		this.nodes[containedNodes[i].getID()] = containedNodes[i];
	this.createVisualCluster();
	this.calculateEdges();
}

Cluster.prototype.createVisualCluster = function() {
	if(Object.keys(this.nodes).length <= 1) {
		var errorMessage = "Only " + Object.keys(this.nodes).length + " nodes matched. More than 1 nodes needed to create a cluster."
		throw new Error(errorMessage);
	}

	var nodes = this.nodes;
	var joinCondition = function(nodeOptions) {
		return nodeOptions.id in nodes; 
	};
	var options = {
		joinCondition: joinCondition,
		clusterNodeProperties: {
			id: this.id,
			title: this.id,
			label: "Cluster",
			shape: "database",
			font: {
				size: 30
			}
		},
		processProperties: function (clusterOptions, childNodes, childEdges) {
			return clusterOptions;
		}
	};

	this.graph._network.cluster(options);
}

Cluster.prototype.delete = function() {
	this.graph._network.openCluster(this.id);
}

Cluster.prototype.getNodes = function() {
	var nodes = [];
	for(var key in this.nodes) nodes.push(this.nodes[key]);
	return nodes;
}

Cluster.prototype.calculateEdges = function() {
	for(var key in this.nodes) {
		var fromID = key;
		var outEdges = this.nodes[fromID].getOutgoingEdges();
		var inEdges = this.nodes[fromID].getIncomingEdges();
		for(var i = 0; i < outEdges.length; i++) {
			var edge = outEdges[i];
			var dstNode = edge.getDestinationNode();
			if(!(dstNode in this.nodes)) {
				if(!(dstNode in this._outgoing) || (this._outgoing[dstNode].rank > edge.getType().rank)) this._outgoing[dstNode] = edge.getType();
			}
		}
		for(var i = 0; i < inEdges.length; i++) {
			var edge = inEdges[i];
			var srcNode = edge.getSourceNode()
			if(!(srcNode in this.nodes)) {
				if(!(srcNode in this._incoming) || (this._incoming[srcNode].rank > edge.getType().rank)) this._incoming[srcNode] = edge.getType();
			}
		}
	}
}
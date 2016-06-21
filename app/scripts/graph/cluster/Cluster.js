"use strict";

function Cluster(id, graph, containedNodes) {
	this.id = id;
	this.graph = graph;

	this.nodes = {};
	this._outgoing = {};
	this._incoming = {};
	this.cookies = {};
	this.cookies[HttpRequest.Type.ROOT] = {};
	this.cookies[HttpRequest.Type.EMBEDDED] = {};

	for(var i = 0; i < containedNodes.length; i++) 
		this.nodes[containedNodes[i].getID()] = containedNodes[i];
	this.createVisualCluster();
	this.calculateEdges();
	this.calculateCookies();
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

	this.graph.createCluster(options);
}

Cluster.prototype.delete = function() {
	this.graph.openCluster(this.id);
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
			var dstNodeID = edge.getDestinationNode().getID();
			if(!(dstNodeID in this.nodes)) {
				if(!(dstNodeID in this._outgoing) || (this._outgoing[dstNodeID].rank > edge.getType().rank)) this._outgoing[dstNodeID] = {'edge': edge};
			}
		}
		for(var i = 0; i < inEdges.length; i++) {
			var edge = inEdges[i];
			var srcNodeID = edge.getSourceNode().getID();
			if(!(srcNodeID in this.nodes)) {
				if(!(srcNodeID in this._incoming) || (this._incoming[srcNodeID].rank > edge.getType().rank)) this._incoming[srcNodeID] = {'edge': edge};
			}
		}
	}
}

Cluster.prototype.getOutgoingEdges = function() {
	var edges = [];
	for(var hostnameKey in this._outgoing) edges.push(this._outgoing[hostnameKey].edge);
	return edges;
}

Cluster.prototype.getIncomingEdges = function() {
	var edges = [];
	for(var hostnameKey in this._incoming) edges.push(this._incoming[hostnameKey].edge);
	return edges;
}

Cluster.prototype.calculateCookies = function() {
	for(var key in this.nodes) {
		var firstPartCookies = this.nodes[key].getFirstPartyCookies();
		var thirdPartyCookies = this.nodes[key].getThirdPartyCookies();
		for(var cookieKey in firstPartCookies) this.cookies[HttpRequest.Type.ROOT][cookieKey] = firstPartCookies[cookieKey];
		for(var cookieKey in thirdPartyCookies) this.cookies[HttpRequest.Type.EMBEDDED][cookieKey] = thirdPartyCookies[cookieKey];
	}
}

Cluster.prototype.getFirstPartyCookies = function() {
	return this.cookies[HttpRequest.Type.ROOT];
}

Cluster.prototype.getThirdPartyCookies = function() {
	return this.cookies[HttpRequest.Type.EMBEDDED];
}
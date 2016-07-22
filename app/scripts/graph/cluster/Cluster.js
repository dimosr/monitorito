"use strict";

/*	@Docs
	Note: nodes included in the cluster & neighbours will be automatically collapsed.
 */
function Cluster(id, containedNodes, clusterOptions, graph, resourcesExplorerEngine) {
	this.edgeIncrement = 1;

	Node.call(this, id, graph);
	this.graph = graph;
	this.resourcesExplorerEngine = resourcesExplorerEngine;

	this.cookies = {};
	this.cookies[HttpRequest.Type.ROOT] = {};
	this.cookies[HttpRequest.Type.EMBEDDED] = {};
	this._requests = [];

	this.clusteredNodes = {};
	for(var i = 0; i < containedNodes.length; i++) this.clusteredNodes[containedNodes[i].getID()] = containedNodes[i];
	this.clusterOptions = clusterOptions;

	this.create();
}

Cluster.prototype = Object.create(Node.prototype);
Cluster.prototype.constructor = Cluster;

Cluster.prototype.getClusterOptions = function() {
	return this.clusterOptions;
}

Cluster.prototype.createVisualNode = function() {
	var options = {
		id: this.getID(),
		title: this.getID(),
		label: this.getID(),
		shape: "dot",
		size: 60,
		color: {
			background: "#66ffd9",  border: "#00b386",
			highlight: { background: "#00e6ac", border: "#004d39"}
		},
		font: {size: 50, background: "white"}
	};
	Node.prototype.createVisualNode.call(this, options);
}

/*	@Docs
 	Creates the cluster, with the following actions
 	- Collapses neighbours & clustered nodes
 	- Detaches clustered nodes
 	- Create cluster node
 	- Create cluster edges
 */
Cluster.prototype.create = function() {
	this.aggregateCookiesAndRequests();

	var resourcesExplorerEngine = this.resourcesExplorerEngine;
	for(var id in this.clusteredNodes) {
		var node = this.clusteredNodes[id];
		resourcesExplorerEngine.collapse(node);
		node.getOutgoingDomainEdges().forEach(function(edge) { if(edge.getDestinationNode() instanceof DomainNode) resourcesExplorerEngine.collapse(edge.getDestinationNode()); });
		node.getIncomingDomainEdges().forEach(function(edge) { if(edge.getSourceNode() instanceof DomainNode)resourcesExplorerEngine.collapse(edge.getSourceNode()); });
	}
	this.createVisualNode();
	this.aggregateEdges();
	this.detachClusteredNodes();
}

/*	@Docs
	Deletes the cluster, with the following actions
	- Collapses neighbours & Removes edges of cluster
	- Removes cluster
	- Attaches clustered nodes back
 */
Cluster.prototype.delete = function() {
	this.getOutgoingDomainEdges().map(function(edge) {
		if(edge.getDestinationNode() instanceof DomainNode) this.resourcesExplorerEngine.collapse(edge.getDestinationNode());
		edge.remove();
	}, this);
	this.getIncomingDomainEdges().map(function(edge) {
		if(edge.getSourceNode() instanceof DomainNode) this.resourcesExplorerEngine.collapse(edge.getSourceNode());
		edge.remove();
	}, this);
	this.remove();
	this.attachClusteredNodes();
}

Cluster.prototype.containsNode = function(node) {
	return node.getID() in this.clusteredNodes;
}

Cluster.prototype.getNodes = function() {
	var nodes = [];
	for(var id in this.clusteredNodes) nodes.push(this.clusteredNodes[id]);
	return nodes;
}

Cluster.prototype.aggregateEdges = function() {
	for(var id in this.clusteredNodes) {
		var node = this.clusteredNodes[id];
		node.getOutgoingDomainEdges().forEach(function(edge) {
			if(!this.containsNode(edge.getDestinationNode())) {
				var clusterEdge;
				if (!this.hasEdgeTo(edge.getDestinationNode())) clusterEdge = new ClusterEdge((this.getID() + "-" + (this.edgeIncrement++)), this, edge.getDestinationNode(), this.graph);
				else clusterEdge = this.getEdgeTo(edge.getDestinationNode());
				clusterEdge.getLinksFromEdge(edge);
			}
		}, this);
		node.getIncomingDomainEdges().forEach(function(edge) {
			if(!this.containsNode(edge.getSourceNode())) {
				var clusterEdge;
				if (!this.hasEdgeFrom(edge.getSourceNode())) clusterEdge = new ClusterEdge((this.getID() + "-" + (this.edgeIncrement++)), edge.getSourceNode(), this, this.graph);
				else clusterEdge = this.getEdgeFrom(edge.getSourceNode());
				clusterEdge.getLinksFromEdge(edge);
			}
		}, this);
	}
}

Cluster.prototype.aggregateCookiesAndRequests = function() {
	for(var id in this.clusteredNodes) {
		var firstPartCookies = this.clusteredNodes[id].getFirstPartyCookies();
		var thirdPartyCookies = this.clusteredNodes[id].getThirdPartyCookies();
		for(var cookieKey in firstPartCookies) this.cookies[HttpRequest.Type.ROOT][cookieKey] = firstPartCookies[cookieKey];
		for(var cookieKey in thirdPartyCookies) this.cookies[HttpRequest.Type.EMBEDDED][cookieKey] = thirdPartyCookies[cookieKey];
	}
}

Cluster.prototype.getOutgoingDomainEdges = function() {
	var filterDomainEdges = function(edge) {return (edge.constructor == DomainEdge);};
	return this.getOutgoingEdges().filter(filterDomainEdges);
}

Cluster.prototype.getIncomingDomainEdges = function() {
	var filterDomainEdges = function(edge) {return (edge.constructor == DomainEdge);};
	return this.getIncomingEdges().filter(filterDomainEdges);
}

Cluster.prototype.getFirstPartyCookies = function() {
	return this.cookies[HttpRequest.Type.ROOT];
}

Cluster.prototype.getThirdPartyCookies = function() {
	return this.cookies[HttpRequest.Type.EMBEDDED];
}

/*	@Docs
 	Detaches all clustered nodes with the following operations:
 	- Locks & Hides the node
 	- Removes all edges to neighbours & hides them
 */
Cluster.prototype.detachClusteredNodes = function() {
	this.getNodes()
		.map(function(node) {
			node.setCluster(this);
			node.hide();
			node.lock();
			return node;
		}, this)
		.forEach(function(node) {
			node.getOutgoingDomainEdges().forEach(function(edge) {
				if(edge.getDestinationNode() instanceof Cluster) edge.remove();
				else if(edge.getDestinationNode() instanceof DomainNode) edge.setDetached(true);
			});
			node.getIncomingDomainEdges().forEach(function(edge) {
				if(edge.getSourceNode() instanceof Cluster) edge.remove();
				else if(edge.getSourceNode() instanceof DomainNode) edge.setDetached(true);
			});
		}, this);
}

/*	@Docs
 	Attaches all clustered nodes with the following operations:
 	- First unclusters all nodes and then
 	- Unlocks & shows each node
 	- Add all edges to neighbours & show them
 */
Cluster.prototype.attachClusteredNodes = function() {
	this.getNodes()
		.map(function(node) {
			node.removeCluster();
			node.unlock();
			node.show();
			return node;
		})
		.forEach(function(node) {
			node.getOutgoingEdges()
				.filter(function(edge) { return edge.isDetached(); })
				.forEach(function(edge) {
					if(edge.getDestinationNode().isClustered()) {
						var cluster = edge.getDestinationNode().getCluster();
						if(node.hasEdgeTo(cluster)) var clusterEdge = node.getEdgeTo(cluster);
						else var clusterEdge = new ClusterEdge(cluster.getID() + "-" + (cluster.edgeIncrement++), node, cluster, this.graph);
						clusterEdge.getLinksFromEdge(edge);
					}
					else edge.setDetached(false);
				}, this);
			node.getIncomingEdges()
				.filter(function(edge) { return edge.isDetached(); })
				.forEach(function(edge) {
					if(edge.getSourceNode().isClustered()) {
						var cluster = edge.getSourceNode().getCluster();
						if(node.hasEdgeFrom(cluster)) var clusterEdge = node.getEdgeFrom(cluster);
						else var clusterEdge = new ClusterEdge(cluster.getID() + "-" + (cluster.edgeIncrement++), cluster, node, this.graph);
						clusterEdge.getLinksFromEdge(edge);
					}
					else edge.setDetached(false);
				}, this);
	}, this);
}

/*	@Docs
	Always returns false
	Clusters cannot be expanded
 */
Cluster.prototype.isExpanded = function() {
	return false;
}
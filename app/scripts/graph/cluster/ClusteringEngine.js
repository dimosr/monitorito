"use strict";

function ClusteringEngine(graph, resourcesExplorerEngine) {
	this.graph = graph;
	this.graph.register(this);
	this.resourcesExplorerEngine = resourcesExplorerEngine;

	this.clusters = {};
}

/*	@Docs
	Creates new cluster, based on clusterOptions
 */
ClusteringEngine.prototype.cluster = function(clusterOptions, clusterID) {
	if(clusterID in this.clusters) throw new Error("Cluster ID '" + clusterID + "' already exists. Cluster could not be created, because Cluster ID should be unique.");

	var nodes = this._getNonFilteredOutNodes();
	var clusteredNodes = [];
	for(var i = 0; i < nodes.length; i++) {
		if(clusterOptions.belongsInCluster(nodes[i]))
			clusteredNodes.push(nodes[i]);
	}

	this.disallowNestedClustering(clusteredNodes, clusterID);
	if(clusteredNodes.length <= 1) {
		var errorMessage = "Only " + clusteredNodes.length + " nodes matched. More than 1 nodes needed to create a cluster.";
		throw new Error(errorMessage);
	}

	var cluster = new Cluster(clusterID, clusteredNodes, clusterOptions, this.graph, this.resourcesExplorerEngine);

	this.clusters[clusterID] = cluster;
}

/*	@Docs
	Edits an existing cluster:
	- Checks if new cluster is valid
	- If yes, delete previous cluster and create a new one (the edited)
	- If not, throw Error
 */
ClusteringEngine.prototype.editCluster = function(clusterOptions, clusterID) {
	if(!(clusterID in this.clusters)) throw new Error("Cluster with ID " + clusterID + "does not exist, so it cannot be edited");

	var nodes = this._getNonFilteredOutNodes();
	var clusteredNodes = [];


	for(var i = 0; i < nodes.length; i++) {
		if(clusterOptions.belongsInCluster(nodes[i]))
			clusteredNodes.push(nodes[i]);
	}
	this.disallowNestedClustering(clusteredNodes, clusterID);
	if(clusteredNodes.length <= 1) {
		var errorMessage = "Only " + clusteredNodes.length + " nodes matched. More than 1 nodes needed to create a cluster.";
		throw new Error(errorMessage);
	}

	this.deCluster(clusterID);

	var cluster = new Cluster(clusterID, clusteredNodes, clusterOptions, this.graph, this.resourcesExplorerEngine);
	this.clusters[clusterID] = cluster;
}

ClusteringEngine.prototype.disallowNestedClustering = function(clusteredNodes, clusterID) {
	for(var key in this.clusters) {
		if(key != clusterID) {	//only checking different clusters
			var cluster = this.clusters[key];
			for (var i = 0; i < clusteredNodes.length; i++) {
				if (cluster.containsNode(clusteredNodes[i]))
					throw new Error("Cluster '" + cluster.getID() + "' already contains one of the matched nodes('" + clusteredNodes[i].getID() + "'). De-cluster it first, if you want to create another cluster, containing it.");
			}
		}
	}
}

ClusteringEngine.prototype.getCluster = function(clusterID) {
	if(clusterID in this.clusters) return this.clusters[clusterID];
	else return null;
}

ClusteringEngine.prototype.getEdge = function(clusterEdgeID) {
	var clusterEdge = null
	var clusterID = clusterEdgeID.split("-")[0];
	if(clusterID !== undefined) {
		var cluster = this.getCluster(clusterID);
		cluster.getOutgoingDomainEdges().forEach(function(edge) {
			if(edge.getID() == clusterEdgeID) clusterEdge = edge;
		});
		cluster.getIncomingEdges().forEach(function(edge) {
			if(edge.getID() == clusterEdgeID) clusterEdge = edge;
		});
	}
	return clusterEdge;
}

ClusteringEngine.prototype.deCluster = function(clusterID) {
	var cluster = this.clusters[clusterID];
	this.graph.triggerDeselectNode(cluster);
	cluster.delete();
	
	delete this.clusters[cluster.getID()];
}

ClusteringEngine.prototype.deClusterAll = function() {
	var clusters = this.getClusters();
	for(var i = 0; i < clusters.length; i++) this.deCluster(clusters[i].getID());
}

ClusteringEngine.prototype.getClusters = function() {
	var clusters = [];
	for(var id in this.clusters)
		clusters.push(this.clusters[id]);
	return clusters;
}

ClusteringEngine.prototype.getClustersEdges = function() {
	var clustersEdges = {};
	this.getClusters().forEach(function(cluster) {
		cluster.getOutgoingDomainEdges()
			   .filter(function(edge) { return edge instanceof ClusterEdge;})
			   .forEach(function(edge) {
				   clustersEdges[edge.getID()] = edge;
			   });
		cluster.getIncomingDomainEdges()
			   .filter(function(edge) { return edge instanceof ClusterEdge;})
			   .forEach(function(edge) {
					clustersEdges[edge.getID()] = edge;
			   });
	});
	return Object.keys(clustersEdges).map(function(id) {return clustersEdges[id];});
}

/*	@Docs
	Returns all nodes to be examined for clustering:
	- All non-clustered nodes, that are not filtered out
	- All clustered-nodes, belonging to clustered nodes that are not filtered out
 */
ClusteringEngine.prototype._getNonFilteredOutNodes = function() {
	var nodes = this.graph.getDomainNodes().filter(function(node) {return node.isVisible()});
	this.getClusters()
		.filter(function(cluster){ return cluster.isVisible(); })
		.forEach(function(cluster) {
			nodes = nodes.concat(cluster.getNodes());
	});
	return nodes;
}

/*	@Docs
 Listener function for graph events
 Incoming nodes are not automatically clustered.
 So, only incoming edges are handled to comply with already formed clusters
 */
ClusteringEngine.prototype.onNewEdge = function(edge) {
	var srcNode = edge.getSourceNode(), dstNode = edge.getDestinationNode(), clusterEdge, cluster;
	if(!srcNode.isClustered() && !dstNode.isClustered()) {
		/* Nothing to do */
	}
	else if(!srcNode.isClustered() && dstNode.isClustered()) {
		edge.setDetached(true);
		cluster = dstNode.getCluster();
		if(srcNode.hasEdgeTo(cluster)) clusterEdge = srcNode.getEdgeTo(cluster);
		else clusterEdge = new ClusterEdge(cluster.getID() + "-" + (cluster.edgeIncrement++), srcNode, cluster, this.graph);
		clusterEdge.getLinksFromEdge(edge);
	}
	else if(srcNode.isClustered() && !dstNode.isClustered()) {
		edge.setDetached(true);
		cluster = srcNode.getCluster();
		if(cluster.hasEdgeTo(dstNode)) clusterEdge = dstNode.getEdgeTo(dstNode);
		else clusterEdge = new ClusterEdge(cluster.getID() + "-" + (cluster.edgeIncrement++), cluster, dstNode, this.graph);
		clusterEdge.getLinksFromEdge(edge);
	}
	else if(srcNode.isClustered() && dstNode.isClustered()) {
		edge.setDetached(true);
		var srcCluster = srcNode.getCluster(), dstCluster = dstNode.getCluster();
		if(srcCluster == dstCluster) /* No need to create self-referencing edges for clusters */;
		else {
			if(srcCluster.hasEdgeTo(dstCluster)) clusterEdge = srcCluster.getEdgeTo(dstCluster);
			else clusterEdge = new ClusterEdge(srcCluster.getID() + "-" + (srcCluster.edgeIncrement++), srcCluster, dstCluster, this.graph);
			clusterEdge.getLinksFromEdge(edge);
		}
	}
}

ClusteringEngine.prototype.onNewNode = function(node) {
	/* Do nothing */
}

ClusteringEngine.prototype.onNodeChange = function(fromType, toType, node) {
	/* Do nothing */
}

ClusteringEngine.prototype.onEdgeChange = function(fromType, toType, edge) {
	/* Do nothing */
}
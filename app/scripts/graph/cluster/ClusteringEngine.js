"use strict";

function ClusteringEngine(graph) {
	this.graph = graph;

	this.clusters = {};
}

/*	@Docs
	Creates new cluster, based on clusterOptions
 */
ClusteringEngine.prototype.cluster = function(clusterOptions, clusterID) {
	if(clusterID in this.clusters) throw new Error("Cluster ID '" + clusterID + "' already exists. Cluster could not be created, because Cluster ID should be unique.");

	var nodes = this.graph.getDomainNodes();
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

	var cluster = new Cluster(clusterID, this.graph, clusteredNodes, clusterOptions);
	this.clusters[clusterID] = cluster;
}

/*	@Docs
	Edits an existing cluster:
	- Checks if new cluster is valid
	- If yes, delete previous cluster and create a new one (the edited)
	- If not, throw Error
 */
ClusteringEngine.prototype.editCluster = function(clusterOptions, clusterID) {
	var nodes = this.graph.getDomainNodes();
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
	var cluster = new Cluster(clusterID, this.graph, clusteredNodes, clusterOptions);
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

ClusteringEngine.prototype.deCluster = function(clusterID) {
	var cluster = this.clusters[clusterID];
	this.graph.triggerDeselectNode(cluster);
	cluster.delete();
	delete this.clusters[clusterID];
}

ClusteringEngine.prototype.deClusterAll = function() {
	var clusters = this.getClusters();
	for(var i = 0; i < clusters.length; i++) this.deCluster(clusters[i].getID());
}

ClusteringEngine.prototype.isClusterEdge = function(ID) {
	return ID.search("clusterEdge") >= 0;
}

ClusteringEngine.prototype.getClusters = function() {
	var clusters = [];
	for(var key in this.clusters)
		clusters.push(this.clusters[key]);
	return clusters;
}
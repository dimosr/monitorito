"use strict";

function ClusteringEngine(graph) {
	this.graph = graph;

	this.clusters = {};
}


ClusteringEngine.prototype.clusterByDomain = function(domains, clusterID) {
	if(clusterID in this.clusters) {
		throw new Error("Cluster ID '" + clusterID + "' already exists. Cluster could not be created, because Cluster ID should be unique.");
	}

	var nodes = this.graph.getNodes();
	var clusteredNodes = [];
	var topLevelDomains = {};
	
	for(var i = 0; i < nodes.length; i++) {
		for(var j = 0; j < domains.length; j++) {
			var domain = domains[j];
			if(nodes[i].getDomain().search(domain) >= 0) {
				clusteredNodes.push(nodes[i]);
				break;
			}
		}
	}

	if(clusteredNodes.length > 1) {
		var cluster = new Cluster(clusterID, this.graph, clusteredNodes);
		this.clusters[clusterID] = cluster;
	}
	else {
		var errorMessage = "Only " + clusteredNodes.length + " nodes matched. More than 1 nodes needed to create a cluster.";
		throw new Error(errorMessage);
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
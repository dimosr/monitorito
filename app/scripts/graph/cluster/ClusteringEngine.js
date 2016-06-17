"use strict";

function ClusteringEngine(graph) {
	this.graph = graph;
	this.clusters = {};
}


ClusteringEngine.prototype.clusterByDomain = function(domains, clusterID) {
	var nodes = this.graph.getNodes();
	var clusteredNodes = [];
	var topLevelDomains = {};

	for(var i = 0; i < nodes.length; i++) {
		for(var j = 0; j < domains.length; j++) {
			var domain = domains[j];
			if(nodes[i].getDomain().search(domain) >= 0) {
				clusteredNodes.push(nodes[i]);
				j = domains.length;
			}
		}
	}
	if(clusteredNodes.length > 0) {
		var cluster = new Cluster(clusterID, this.graph, clusteredNodes);
		this.clusters[clusterID] = cluster;
	}
}

ClusteringEngine.prototype.getCluster = function(clusterID) {
	if(clusterID in this.clusters) return this.clusters[clusterID];
	else return null;
}

ClusteringEngine.prototype.deCluster = function(clusterID) {
	var cluster = this.clusters[clusterID];
	cluster.delete();
	delete this.clusters[clusterID];
}
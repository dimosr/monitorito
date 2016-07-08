"use strict";

function GraphHandler(graphStatsCalculator) {
	this.graphStatsCalculator = graphStatsCalculator;
}

GraphHandler.prototype.setGraph = function(graph) {
	this.graph = graph;
	this.graph.register(this.graphStatsCalculator);

	this.clusteringEngine = new ClusteringEngine(graph);
	this.graph.setClusteringEngine(this.clusteringEngine);

	this.resourcesExplorerEngine = new ResourcesExplorerEngine(graph);
	this.filteringEngine = new FilteringEngine(this.graph, this.graphStatsCalculator);
}

GraphHandler.prototype.getGraph = function() {
	return this.graph;
}

GraphHandler.prototype.setController = function(controller) {
	this.controller = controller;
}

GraphHandler.prototype.getGraphStatistics = function() {
	return this.graphStatsCalculator.getStatistics();
}

GraphHandler.prototype.getGraphNodeMetrics = function(node) {
	return this.graphStatsCalculator.getNodeMetrics(node);
}

GraphHandler.prototype.disableGraphPhysics = function() {
	this.graph.disablePhysics();
}

GraphHandler.prototype.enableGraphPhysics = function() {
	this.graph.enablePhysics();
}

GraphHandler.prototype.addRequest = function(rootRequest, request) {
	this._ensureNodeExists(Util.getUrlHostname(request.url));
	var node = this.graph.getNode(Util.getUrlHostname(request.url));
	node.addRequest(request);

	if(request.hasReferer()) {
		this._ensureNodeExists(Util.getUrlHostname(request.getReferer()));
		this._ensureEdgeExists(Util.getUrlHostname(request.getReferer()), Util.getUrlHostname(request.url));
		var edge = this.graph.getEdgeBetweenNodes(Util.getUrlHostname(request.getReferer()), Util.getUrlHostname(request.url));
		edge.addLink(request.getReferer(), request, DomainEdge.Type.REFERRAL);
	}
	else {
		this._ensureNodeExists(Util.getUrlHostname(rootRequest.url));
		if(request.type != HttpRequest.Type.ROOT) {
			this._ensureEdgeExists(Util.getUrlHostname(rootRequest.url), Util.getUrlHostname(request.url));
			var edge = this.graph.getEdgeBetweenNodes(Util.getUrlHostname(rootRequest.url), Util.getUrlHostname(request.url));
			edge.addLink(rootRequest.url, request, DomainEdge.Type.REQUEST);
		}
	}
}

GraphHandler.prototype.addRedirect = function(redirect) {
	var fromHostname = Util.getUrlHostname(redirect.getInitialURL());
	var toHostname = Util.getUrlHostname(redirect.getFinalURL());
	this._ensureNodeExists(fromHostname);
	this._ensureNodeExists(toHostname);
	this._ensureEdgeExists(fromHostname, toHostname);
	var edge = this.graph.getEdgeBetweenNodes(Util.getUrlHostname(redirect.getInitialURL()), Util.getUrlHostname(redirect.getFinalURL()));
	edge.addLink(redirect.getInitialURL(), redirect, DomainEdge.Type.REDIRECT);
}

GraphHandler.prototype._ensureNodeExists = function(domain) {
	if(!this.graph.existsNode(domain)) this.graph.createDomainNode(domain);
}

GraphHandler.prototype._ensureEdgeExists = function(fromDomain, toDomain) {
	if(!this.graph.existsEdge(fromDomain, toDomain)) this.graph.createDomainEdge(fromDomain, toDomain);
}

GraphHandler.prototype.addGraphListeners = function(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn) {
	this.graph.addListeners(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn);
}

GraphHandler.prototype.clusterByDomain = function(domains, clusterID) {
	this.clusteringEngine.clusterByDomain(domains, clusterID);
}

GraphHandler.prototype.deleteCluster = function(clusterID) {
	this.clusteringEngine.deCluster(clusterID);
}

GraphHandler.prototype.getClusters = function() {
	return this.clusteringEngine.getClusters();
}

GraphHandler.prototype.deleteAllClusters = function() {
	this.clusteringEngine.deClusterAll();
}

GraphHandler.prototype.expandDomainNode = function(nodeID) {
	if(!(this.graph.getNode(nodeID) instanceof DomainNode)) throw new Error("Only Domain Nodes can be expanded");
	this.resourcesExplorerEngine.expand(this.graph.getNode(nodeID))
}

GraphHandler.prototype.collapseDomainNode = function(nodeID) {
	if(!(this.graph.getNode(nodeID) instanceof DomainNode)) throw new Error("Only Domain Nodes can be collapsed");
	this.resourcesExplorerEngine.collapse(this.graph.getNode(nodeID));
}

GraphHandler.prototype.getExpandedNodes = function() {
	return this.resourcesExplorerEngine.getExpandedDomainNodes();
}

GraphHandler.prototype.collapseExpandedNodes = function() {
	this.resourcesExplorerEngine.collapseAllExpandedNodes();
}

GraphHandler.prototype.applyFilter = function(filterOptions) {
	this.filteringEngine.filter(filterOptions);
}

GraphHandler.prototype.resetFilter = function() {
	this.filteringEngine.resetFilter();
}

GraphHandler.prototype.isFilterActive = function() {
	return this.filteringEngine.isFilterActive();
}
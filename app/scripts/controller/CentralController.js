"use strict";

function CentralController(interfaceHandler, monitoringService, graphHandler, storageService) {
	this.interfaceHandler = interfaceHandler;
	this.monitoringService = monitoringService;
	this.graphHandler = graphHandler;
	this.storageService = storageService;
}

CentralController.prototype.addRequestToGraph = function(httpRootRequest, httpCurrentRequest) {
	this.graphHandler.addRequest(httpRootRequest, httpCurrentRequest);
}

CentralController.prototype.addRedirectToGraph = function(redirect) {
	this.graphHandler.addRedirect(redirect);
}

CentralController.prototype.enableMonitoring = function() {
	this.monitoringService.enable();
}

CentralController.prototype.disableMonitoring = function() {
	this.monitoringService.disable();
}

CentralController.prototype.extractMonitoredData = function() {
	this.storageService.extractData();
}

CentralController.prototype.extractGraphData = function() {
	var graph = this.graphHandler.getGraph();
	var storageService = this.storageService;
	this.interfaceHandler.executeWithLoader(function() { storageService.extractGraph(graph); });
}

CentralController.prototype.resetData = function() {
	var controller = this;
	this.interfaceHandler.executeWithLoader(function() {
		controller.storageService.clearStorage();
		controller.graphHandler.emptyGraph();
		controller.monitoringService.reset();
		controller.interfaceHandler.hideFilterRibbon();
	});
}

CentralController.prototype.getGraphStatistics = function() {
	return this.graphHandler.getGraphStatistics();
}

CentralController.prototype.getGraphNodeMetrics = function(node) {
	return this.graphHandler.getGraphNodeMetrics(node);
}

CentralController.prototype.disableGraphPhysics = function() {
	this.graphHandler.disableGraphPhysics();
}

CentralController.prototype.enableGraphPhysics = function() {
	this.graphHandler.enableGraphPhysics();
}

CentralController.prototype.enableStraightEdges = function() {
	this.graphHandler.enableStraightEdges();
}

CentralController.prototype.disableStraightEdges = function() {
	this.graphHandler.disableStraightEdges();
}

CentralController.prototype.storeRequest = function(sesssionID, request) {
	this.storageService.storeRequest(sesssionID, request);
}

CentralController.prototype.storeRedirect = function(sessionID, redirect) {
	this.storageService.storeRedirect(sessionID, redirect);
}

CentralController.prototype.showLoader = function() {
	this.interfaceHandler.showLoader();
}

CentralController.prototype.hideLoader = function() {
	this.interfaceHandler.hideLoader();
}

CentralController.prototype.cluster = function(clusterOptions, clusterID) {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() { graphHandler.cluster(clusterOptions, clusterID); });
}

CentralController.prototype.editCluster = function(clusterOptions, clusterID) {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() { graphHandler.editCluster(clusterOptions, clusterID); });
}

CentralController.prototype.deleteCluster = function(clusterID) {
	this.graphHandler.deleteCluster(clusterID);
}

CentralController.prototype.deleteAllClusters = function() {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() { graphHandler.deleteAllClusters(); });

	this.interfaceHandler.emptyNodeInfo();
	this.interfaceHandler.emptyEdgeInfo();
}

CentralController.prototype.existClusters = function() {
	return (this.graphHandler.getClusters().length > 0);
}

CentralController.prototype.expandDomainNode = function(nodeID) {
	this.graphHandler.expandDomainNode(nodeID);
}

CentralController.prototype.collapseDomainNode = function(nodeID) {
	this.graphHandler.collapseDomainNode(nodeID);
}

CentralController.prototype.existExpandedNodes = function() {
	return (this.graphHandler.getExpandedNodes().length > 0);
}

CentralController.prototype.collapseAllNodes = function() {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() { graphHandler.collapseAllNodes() });

	this.interfaceHandler.emptyNodeInfo();
	this.interfaceHandler.emptyEdgeInfo();
}

CentralController.prototype.expandAllNodes = function() {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() { graphHandler.expandAllNodes() });
}

CentralController.prototype.applyFilter = function(filterOptions) {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() {graphHandler.applyFilter(filterOptions);});
	this.interfaceHandler.showFilterRibbon();
}

CentralController.prototype.resetFilter = function() {
	var graphHandler = this.graphHandler;
	this.interfaceHandler.executeWithLoader(function() {graphHandler.resetFilter();});
	this.interfaceHandler.hideFilterRibbon();
}

CentralController.prototype.isFilterActive = function() {
	return this.graphHandler.isFilterActive();
}

CentralController.prototype.setGraphMode = function(mode) {
	var graphHandler = this.graphHandler;
	var interfaceHandler = this.interfaceHandler;
	var factory = new GraphFactory();
	if(mode == Graph.Mode.ONLINE) {
	    var graph = factory.buildGraph(Graph.Mode.ONLINE, interfaceHandler.getGraphDomElement());

	    graphHandler.setGraph(graph);
		var selectNodeCallback = function(selectedNode) {
			interfaceHandler.emptyEdgeInfo();
			interfaceHandler.emptyNodeInfo();
			interfaceHandler.emptyClusterInfo();
			if(selectedNode instanceof Cluster)
				interfaceHandler.showClusterInfo(selectedNode);
			else if(selectedNode instanceof Node)
				interfaceHandler.showNodeInfo(selectedNode);
		};
		var selectEdgeCallback = function(selectedEdge) {
			interfaceHandler.emptyEdgeInfo();
			interfaceHandler.emptyNodeInfo();
			interfaceHandler.emptyClusterInfo();
			interfaceHandler.showEdgeInfo(selectedEdge);
		};
		var deselectNodeCallback = function(deselectedNode) {
			interfaceHandler.emptyNodeInfo();
			interfaceHandler.emptyClusterInfo();
		};
		var deselectEdgeCallback = function(deselectedEdge) {
			interfaceHandler.emptyEdgeInfo();
		}
		graphHandler.addGraphListeners(selectNodeCallback, selectEdgeCallback, deselectNodeCallback, deselectEdgeCallback);
	}
	else if(mode == Graph.Mode.OFFLINE){
		interfaceHandler.disableVisualisation();
		var graph = factory.buildGraph(Graph.Mode.OFFLINE, null);
		graphHandler.setGraph(graph);
	}
	else {
		throw new Error("Provided mode invalid: not a Graph.Mode value");
	}
}
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
	this.storageService.extractGraph(this.graphHandler.getGraph());
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

CentralController.prototype.clusterByDomain = function(domains, clusterID) {
	if(this.graphHandler.getExpandedNodes().length > 0) throw new Error("Cannot create cluster, when there are expanded resources. Please collapse all resources first.");
	else this.graphHandler.clusterByDomain(domains, clusterID);
}

CentralController.prototype.deleteCluster = function(clusterID) {
	this.graphHandler.deleteCluster(clusterID);
}

CentralController.prototype.deleteAllClusters = function() {
	this.graphHandler.deleteAllClusters();
	this.interfaceHandler.emptyNodeInfo();
	this.interfaceHandler.emptyEdgeInfo();
}

CentralController.prototype.expandDomainNode = function(nodeID) {
	if(this.graphHandler.getClusters().length > 0) throw new Error("Cannot expand Resources, when there are active clusters. Please delete all clusters first.");
	else this.graphHandler.expandDomainNode(nodeID);
}

CentralController.prototype.collapseDomainNode = function(nodeID) {
	this.graphHandler.collapseDomainNode(nodeID);
}

CentralController.prototype.collapseExpandedNodes = function() {
	this.graphHandler.collapseExpandedNodes();
	this.interfaceHandler.emptyNodeInfo();
	this.interfaceHandler.emptyEdgeInfo();
}

CentralController.prototype.applyFilter = function(filterOptions) {
	this.graphHandler.applyFilter(filterOptions);
}

CentralController.prototype.resetFilter = function() {
	this.graphHandler.deleteAllClusters();
	this.graphHandler.resetFilter();
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
			if(selectedNode instanceof Node) {
				interfaceHandler.emptyClusterInfo();
				interfaceHandler.showNodeInfo(selectedNode);
			}
			else if(selectedNode instanceof Cluster) {
				interfaceHandler.emptyNodeInfo();
				interfaceHandler.showClusterInfo(selectedNode);
			}
		};
		var selectEdgeCallback = function(selectedEdge) {
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
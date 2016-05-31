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
	this.monitoringService.archiveRemainingData();
	this.storageService.extractData();
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

CentralController.prototype.storeSession = function(session) {
	this.storageService.storeSession(session);
}

CentralController.prototype.storeRedirect = function(redirect) {
	this.storageService.storeRedirect(redirect);
}

CentralController.prototype.setGraphMode = function(mode) {
	var graphHandler = this.graphHandler;
	var interfaceHandler = this.interfaceHandler;
	if(mode == Graph.Mode.ONLINE) {
		var container = $('#graph')[0];
	    var options = {
			edges: {
				smooth: false
			},
			interaction: {
				tooltipDelay: 0,
				keyboard: true,
				navigationButtons: true
			},
			physics: {
				barnesHut: {
					gravitationalConstant: -14000,
					centralGravity: 0,
					springLength: 250,
					springConstant: 0.1,
					avoidOverlap: 0.5
				},
				solver: "barnesHut"
			}
		};
		var data = {
			nodes: new vis.DataSet([]),
			edges: new vis.DataSet([])
		};
	    var visNetwork = new vis.Network(container, data, options);
	    var graph = new Graph(visNetwork);

	    graphHandler.setGraph(graph);
	    graphHandler.addSelectNodeListener(function(selectedNode) {
			interfaceHandler.emptyEdgeStatistics();
			interfaceHandler.showNodeStatistics(selectedNode);
		});
		graphHandler.addSelectEdgeListener(function(selectedEdge) {
			interfaceHandler.emptyNodeStatistics();
			interfaceHandler.showEdgeStatistics(selectedEdge);
		});
		graphHandler.addDeselectNodeListener(function(deselectedNodes) {
			interfaceHandler.emptyNodeStatistics();
		});
		graphHandler.addDeselectEdgeListener(function(deselectedEdges) {
			interfaceHandler.emptyEdgeStatistics();
		});
	}
	else if(mode == Graph.Mode.OFFLINE){
		interfaceHandler.disableVisualisation();
		var graph = new Graph(null);
		graphHandler.setGraph(graph);
	}
}
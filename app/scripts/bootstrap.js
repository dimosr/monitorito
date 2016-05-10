"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
	var interfaceHandler = new InterfaceHandler();

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


    var graphHandler = new GraphHandler(graph);
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

	var eventSource = new ChromeEventSource(chrome);
	eventSource.collectRequests();
	eventSource.collectRedirects();

	var monitoringService = new MonitoringService(eventSource);
	monitoringService.addExcludedUrlPattern("/_/chrome/newtab");

	var controller = new CentralController(interfaceHandler, monitoringService, graphHandler);
	monitoringService.setController(controller);
	graphHandler.setController(controller);
	interfaceHandler.setController(controller);
});

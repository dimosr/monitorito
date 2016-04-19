"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
	var interfaceHandler = new InterfaceHandler();
	interfaceHandler.enableWidgetDialogs();

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


    var graphController = new GraphController(graph, interfaceHandler);
	graphController.addSelectNodeListener(function(selectedNode) {
		interfaceHandler.emptyEdgeStatistics();
		interfaceHandler.showNodeStatistics(selectedNode);
	});
	graphController.addSelectEdgeListener(function(selectedEdge) {
		interfaceHandler.emptyNodeStatistics();
		interfaceHandler.showEdgeStatistics(selectedEdge);
	});
	graphController.addDeselectNodeListener(function(deselectedNodes) {
		interfaceHandler.emptyNodeStatistics();
	});
	graphController.addDeselectEdgeListener(function(deselectedEdges) {
		interfaceHandler.emptyEdgeStatistics();
	});

	var eventSource = new ChromeEventSource();
	eventSource.collectRequests();
	eventSource.collectRedirects();

	var monitoringService = new MonitoringService(eventSource, graphController);
	monitoringService.addExcludedUrlPattern("https://www.google.gr/_/chrome/newtab");
});

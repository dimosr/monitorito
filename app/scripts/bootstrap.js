document.addEventListener("DOMContentLoaded", function(event) {
	interfaceHandler = new InterfaceHandler();
	interfaceHandler.enableWidgetDialogs();

    var container = $('#graph')[0];
    var graph = new Graph(container);
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

	var monitoringService = new MonitoringService(eventSource, graphController);
	monitoringService.addExcludedUrlPattern("https://www.google.gr/_/chrome/newtab");

	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			var httpRequest = eventSource.buildHttpRequest(details);
			eventSource.notifyForRequest(httpRequest, details.tabId);
		},
		{urls: ["<all_urls>"]},
		['requestBody']
	);

	chrome.webRequest.onBeforeRedirect.addListener(
		function(details) {
			var redirect = eventSource.buildRedirect(details);
			eventSource.notifyForRedirect(redirect);
		},
		{urls: ["<all_urls>"]}
	);

});

document.addEventListener("DOMContentLoaded", function(event) {
	interfaceHandler = new InterfaceHandler();
	interfaceHandler.enableWidgetDialogs();

    var container = $('#graph')[0];

	graph = new Graph(container, interfaceHandler);

	graph.onSelectNode(function(selectedNode) {
		interfaceHandler.emptyEdgeStatistics();
		interfaceHandler.showNodeStatistics(selectedNode);
	});
	graph.onSelectEdge(function(selectedEdge) {
		interfaceHandler.emptyNodeStatistics();
		interfaceHandler.showEdgeStatistics(selectedEdge);
	});
	graph.onDeselectNode(function(deselectedNodes) {
		interfaceHandler.emptyNodeStatistics();
	});
	graph.onDeselectEdge(function(deselectedEdges) {
		interfaceHandler.emptyEdgeStatistics();
	});

	var eventSource = new ChromeEventSource();

	var monitoringService = new MonitoringService(eventSource);
	monitoringService.addExcludedUrlPattern("https://www.google.gr/_/chrome/newtab");

	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			var httpRequest = eventSource.buildHttpRequest(details);
			eventSource.notifyForRequest(httpRequest, (details.type == "main_frame"), details.tabId);
		},
		{urls: ["<all_urls>"]},
		['requestBody']
	);

	chrome.webRequest.onBeforeRedirect.addListener(
		function(details) {
			eventSource.notifyForRedirect(details);
		},
		{urls: ["<all_urls>"]}
	);

});

document.addEventListener("DOMContentLoaded", function(event) {
	InterfaceHandler.enableNodeEdgeDialog();

    var container = $('#graph')[0];

	graph = new Graph(container);

	graph.onSelectNode(function(selectedNode) {
		InterfaceHandler.emptyEdgeStatistics();
		InterfaceHandler.showNodeStatistics(selectedNode);
	});
	graph.onSelectEdge(function(selectedEdge) {
		InterfaceHandler.emptyNodeStatistics();
		InterfaceHandler.showEdgeStatistics(selectedEdge);
	});
	graph.onDeselectNode(function(deselectedNodes) {
		InterfaceHandler.emptyNodeStatistics();
	});
	graph.onDeselectEdge(function(deselectedEdges) {
		InterfaceHandler.emptyEdgeStatistics();
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

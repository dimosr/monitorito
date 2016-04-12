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
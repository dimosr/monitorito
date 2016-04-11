var eventSource = new ChromeEventSource();

var monitoringService = new MonitoringService(eventSource);
monitoringService.addExcludedUrlPattern("https://www.google.gr/_/chrome/newtab");

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		eventSource.notifyForRequest(details);
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
window.monitor = true;
archive = {};
tabsMappings = {};

chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		if(monitor) logRequest(details);
	},
	{urls: ["<all_urls>"]}
);

function logRequest(details) {
	if(details.type == "main_frame") {
		tabsMappings[details.tabId] = {'initialURL': details.url};
		if(!(details.url in archive)) archive[details.url] = {'requests': []}
	}
	if(details.tabId in tabsMappings) {
		initialURL = tabsMappings[details.tabId].initialURL;
		archive[initialURL].requests.push(details);
		addRequestNode(initialURL, details);
	}
}
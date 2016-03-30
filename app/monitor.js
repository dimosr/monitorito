archiveAutoIncrement = 1;
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
		archive[archiveAutoIncrement] = {'rootRequestURL': details.url, 'requests': []};
		tabsMappings[details.tabId] = {'rootRequestId': archiveAutoIncrement};
		archiveAutoIncrement++;
	}
	if(details.tabId in tabsMappings) {
		var ID = tabsMappings[details.tabId].rootRequestId;
		archive[ID].requests.push(details);
		addRequestNode(archive[ID].rootRequestURL, details);
	}
}
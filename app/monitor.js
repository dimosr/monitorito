archiveAutoIncrement = 1;
window.monitor = true;
archive = {};
tabsMappings = {};

excludedUrlPatterns = ["https://www.google.gr/_/chrome/newtab"];

function isExcluded(url) {
	for(var i=0; i < excludedUrlPatterns.length; i++) {
		var excludedPattern = excludedUrlPatterns[i];
		if(url.toLowerCase().search(excludedPattern.toLowerCase()) >= 0) return true;
	}
	return false;
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if(monitor && !isExcluded(details.url)) logRequest(details);
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onBeforeRedirect.addListener(
	function(details) {
		if(monitor && !isExcluded(details.url)) logRedirect(details);
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

function logRedirect(details) {
	if(details.tabId in tabsMappings) {
		var previousURL = details.url;
		var newURL = details.redirectUrl;

		var parsedPreviousURL = parseURL(previousURL);
		var parsedNewURL = parseURL(newURL);
		if(parsedPreviousURL.hostname != parsedNewURL.hostname) {		//not http -> https redirect
			var ID = tabsMappings[details.tabId].rootRequestId;
			if(details.type == "main_frame") archive[ID].redirectedTo = newURL;
			else {
				var requests = archive[ID].requests;
				for(var requestID in requests) {
					if(requests[requestID].url == previousURL) requests[requestID].redirectedTo = newURL;
				}
			}		
				
			if(!existsEdge(parsedPreviousURL, parsedNewURL, EdgeType.REDIRECT)) {
				if(!(parsedNewURL.hostname in graph)) createGraphNode(parsedNewURL, details.type == "main_frame");
				createRedirectEdge(parsedPreviousURL, parsedNewURL);
			} 
		}
	}
}
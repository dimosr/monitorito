archiveAutoIncrement = 1;
window.monitor = true;
archive = {};
tabsMappings = {};
redirects = {};

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
	{urls: ["<all_urls>"]},
	['requestBody']
);

chrome.webRequest.onBeforeRedirect.addListener(
	function(details) {
		if(monitor && !isExcluded(details.url)) logRedirect(details);
	},
	{urls: ["<all_urls>"]}
);

function logRequest(request) {
	request.url = new URI(request.url);
	if(request.type == "main_frame") {
		archive[archiveAutoIncrement] = {'rootRequest': request, 'requests': []};
		tabsMappings[request.tabId] = {'requestsGroup': archive[archiveAutoIncrement]};
		archiveAutoIncrement++;
		addRequestNode(request, request);
	}
	else if(request.tabId in tabsMappings) {
		var requestsGroup = tabsMappings[request.tabId].requestsGroup;
		requestsGroup.requests.push(request);
		addRequestNode(requestsGroup.rootRequest, request);
	}

	if(request.url.hostname() in redirects) {
		createRedirectEdge(redirects[request.url.hostname()], request);
	}
	
}

function logRedirect(request) {
	if(request.tabId in tabsMappings) {
		request.url = new URI(request.url);
		var previousURL = request.url;
		var newURL = new URI(request.redirectUrl);
		if(previousURL.hostname() != newURL.hostname()) {		//not http -> https redirect
			var requestsGroup = tabsMappings[request.tabId].requestsGroup;
			if(request.type == "main_frame") requestsGroup.redirectedTo = newURL;
			else {
				var requests = requestsGroup.requests;
				for(var requestID in requests) {
					if(requests[requestID].url == previousURL) requests[requestID].redirectedTo = newURL;
				}
			}		
				
			if(!existsEdge(previousURL.hostname(), newURL.hostname(), EdgeType.REDIRECT)) redirects[newURL.hostname()] = request;
		}
	}
}
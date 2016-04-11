function MonitoringService(eventSource) {
	this._archiveAutoIncrement = 0;
	this._monitorEnabled = true;
	this._archive = [];
	this._redirects = {};
	this._excludedUrlPatterns = [];
	this._tabsMappings = {};

	eventSource.register(this);
}

MonitoringService.prototype.disable = function() {
	this._monitorEnabled = false;
};

MonitoringService.prototype.enable = function() {
	this._monitorEnabled = true;
};

MonitoringService.prototype.isEnabled = function() {
	return this._monitorEnabled;
};

MonitoringService.prototype.addExcludedUrlPattern = function(url) {
	this._excludedUrlPatterns.push(url);
}

MonitoringService.prototype.toBeExcluded = function(url) {
	for(var i=0; i < this._excludedUrlPatterns.length; i++) {
		var excludedPattern = this._excludedUrlPatterns[i];
		if(url.toLowerCase().search(excludedPattern.toLowerCase()) >= 0) return true;
	}
	return false;
}

MonitoringService.prototype.onRequest = function(request) {
	if(this._monitorEnabled && !this.toBeExcluded(request.url)) {
		request.url = new URI(request.url);
		if(request.type == "main_frame") {
			this._archive[this._archiveAutoIncrement] = {'rootRequest': request, 'requests': []};
			this._tabsMappings[request.tabId] = {'requestsGroup': this._archive[this._archiveAutoIncrement]};
			this._archiveAutoIncrement++;
			addRequestNode(request, request);
		}
		else if(request.tabId in this._tabsMappings) {
			var requestsGroup = this._tabsMappings[request.tabId].requestsGroup;
			requestsGroup.requests.push(request);
			addRequestNode(requestsGroup.rootRequest, request);
		}

		if(request.url.hostname() in this._redirects) {
			createRedirectEdge(this._redirects[request.url.hostname()], request);
		}
	}
};

MonitoringService.prototype.onRedirect = function(request) {
	if(this._monitorEnabled && !this.toBeExcluded(request.url)) {
		if(request.tabId in this._tabsMappings) {
			request.url = new URI(request.url);
			var previousURL = request.url;
			var newURL = new URI(request.redirectUrl);
			if(previousURL.hostname() != newURL.hostname()) {		//not http -> https redirect
				var requestsGroup = this._tabsMappings[request.tabId].requestsGroup;
				if(request.type == "main_frame") requestsGroup.redirectedTo = newURL;
				else {
					var requests = requestsGroup.requests;
					for(var requestID in requests) {
						if(requests[requestID].url == previousURL) requests[requestID].redirectedTo = newURL;
					}
				}		
					
				if(!existsEdge(previousURL.hostname(), newURL.hostname(), EdgeType.REDIRECT)) this._redirects[newURL.hostname()] = request;
			}
		}
	}
};
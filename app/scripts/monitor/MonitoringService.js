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

MonitoringService.prototype.onRequest = function(httpRequest, isRoot, tabID) {
	if(this._monitorEnabled && !this.toBeExcluded(httpRequest.url)) {
		if(isRoot) {
			var session = new Session(httpRequest);
			this._archive[this._archiveAutoIncrement] = session;
			this._tabsMappings[tabID] = {'session': session};
			this._archiveAutoIncrement++;
			addRequestNode(httpRequest, httpRequest);
		}
		else if(tabID in this._tabsMappings) {
			var session = this._tabsMappings[tabID].session;
			session.addEmbeddedRequest(httpRequest);
			addRequestNode(session.getRootRequest(), httpRequest);
		}

		if(httpRequest.getHostname() in this._redirects) {
			createRedirectEdge(this._redirects[httpRequest.getHostname()], httpRequest);
		}
	}
};

MonitoringService.prototype.onRedirect = function(request) {
	if(this._monitorEnabled && !this.toBeExcluded(request.url)) {
		if(request.tabId in this._tabsMappings) {
			var previousURL = new URI(request.url);
			var newURL = new URI(request.redirectUrl);
			var session = this._tabsMappings[request.tabId].session;
			session.addRedirect(previousURL, newURL);
			var httpRequest = new HttpRequest(request.method, request.url, request.timestamp, null);	
			if(!existsEdge(previousURL.hostname(), newURL.hostname(), EdgeType.REDIRECT)) this._redirects[newURL.hostname()] = httpRequest;
		}
	}
};
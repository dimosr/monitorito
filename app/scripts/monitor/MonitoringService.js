"use strict";

function MonitoringService(eventSource, graphController) {
	this._monitorEnabled = true;
	this._requestsArchive = [];
	this._redirectsArchive = [];
	this._excludedUrlPatterns = [];
	this._tabSessionMap = {};
	this._redirectedRequests = {};

	eventSource.register(this);
	this.graphController = graphController;
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

MonitoringService.prototype.onRequest = function(httpRequest, tabID) {
	if(this._monitorEnabled && !this.toBeExcluded(httpRequest.url)) {
		if(this._isTabMonitored(tabID) || httpRequest.type == HttpRequest.Type.ROOT) {
			var session = this._archiveRequest(httpRequest, tabID);
			this.graphController.addRequest(session.getRootRequest(), httpRequest);

			this.checkForRedirect(httpRequest);
		}
	}
};

MonitoringService.prototype.onRedirect = function(redirect, tabID) {
	if(this._monitorEnabled && !this.toBeExcluded(redirect.getInitialURL())) {
		if(this._isTabMonitored(tabID) || redirect.type == HttpRequest.Type.ROOT) {
			this._archiveRedirect(redirect);
			this._redirectedRequests[redirect.getFinalURL()] = redirect;
		}
	}
};

MonitoringService.prototype._archiveRequest = function(httpRequest, tabID) {
	if(httpRequest.type == HttpRequest.Type.ROOT) {
		var session = new Session(httpRequest);
		this._requestsArchive.push(session);
		this._monitorTabSession(tabID, session);
	}
	else {
		var session = this._getTabSession(tabID);
		session.addEmbeddedRequest(httpRequest);
	}
	return session;
}

MonitoringService.prototype._archiveRedirect = function(redirect) {
	this._redirectsArchive.push(redirect);
}

MonitoringService.prototype.checkForRedirect = function(httpRequest) {
	if(httpRequest.url in this._redirectedRequests) {
		var redirect = this._redirectedRequests[httpRequest.url];
		this.graphController.addRedirect(redirect);
	}
}

MonitoringService.prototype._isTabMonitored = function(tabID) {
	return (tabID in this._tabSessionMap);
}

MonitoringService.prototype._monitorTabSession = function(tabID, launchedSession) {
	this._tabSessionMap[tabID] = {'session': launchedSession};
}

MonitoringService.prototype._getTabSession = function(tabID) {
	return this._tabSessionMap[tabID].session;
}
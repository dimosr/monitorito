"use strict";

function MonitoringService(eventSource) {
	this._monitorEnabled = true;
	this._sessionsArchive = [];
	this._redirectsArchive = [];
	this._excludedUrlPatterns = [];
	this._tabSessionMap = {};
	this._redirectedRequests = {};

	eventSource.register(this);
}

MonitoringService.prototype.setController = function(controller) {
	this.controller = controller;
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

MonitoringService.prototype.addExcludedUrlPattern = function(regExp) {
	this._excludedUrlPatterns.push(regExp);
}

MonitoringService.prototype.toBeExcluded = function(url) {
	for(var i=0; i < this._excludedUrlPatterns.length; i++) {
		var excludedPattern = this._excludedUrlPatterns[i];
		if(url.search(excludedPattern) >= 0) return true;
	}
	return false;
}

MonitoringService.prototype.onRequest = function(httpRequest, tabID) {
	if(this._monitorEnabled && !this.toBeExcluded(httpRequest.url)) {
		if(this._isTabMonitored(tabID) || httpRequest.type == HttpRequest.Type.ROOT) {
			var session = this._archiveRequest(httpRequest, tabID);
			this.controller.addRequestToGraph(session.getRootRequest(), httpRequest);

			this._checkForRedirect(httpRequest);
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
		this._sessionsArchive.push(session);
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

MonitoringService.prototype._checkForRedirect = function(httpRequest) {
	if(httpRequest.url in this._redirectedRequests) {
		var redirect = this._redirectedRequests[httpRequest.url];
		this.controller.addRedirectToGraph(redirect);
		delete this._redirectedRequests[httpRequest.url];
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

MonitoringService.prototype.getSessionsArchive = function() {
	return this._sessionsArchive;
}

MonitoringService.prototype.getRedirectsArchive = function() {
	return this._redirectsArchive;
}
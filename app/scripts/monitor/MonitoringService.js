"use strict";

function MonitoringService(eventSource) {
	eventSource.register(this);

	this._monitorEnabled = true;
	this._excludedUrlPatterns = [];
	
	this._tabSessionMap = {};
	this._openRequests = {};
	this.sessionIncrement = 1;
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

MonitoringService.prototype.shouldBeMonitored = function(requestID) {
	return this._monitorEnabled && (requestID in this._openRequests);
}

MonitoringService.prototype.onRequest = function(requestID, httpRequest, tabID) {
	if(this._monitorEnabled && !this.toBeExcluded(httpRequest.url)) {
		if(this._isTabMonitored(tabID) || httpRequest.type == HttpRequest.Type.ROOT) {		//start monitoring sessions only after ROOT Request
			var session = this.addRequestToSession(httpRequest, tabID);
			this._openRequests[requestID] = {'session': session, 'request': httpRequest};
		}
	}
}

MonitoringService.prototype.onRequestHeaders = function(requestID, headers) {
	if(this.shouldBeMonitored(requestID)) {
		var session = this._openRequests[requestID].session;
		var request = this._openRequests[requestID].request;
		request.setHeaders(headers);
	}
}

MonitoringService.prototype.onRedirect = function(requestID, redirect) {
	if(this.shouldBeMonitored(requestID)) {
		var session = this._openRequests[requestID].session;
		this.onRequestCompleted(requestID);
		this.controller.addRedirectToGraph(redirect);
		this._archiveRedirect(session.id, redirect);
	}
}

MonitoringService.prototype.onRequestCompleted = function(requestID) {
	if(this.shouldBeMonitored(requestID)) {
		var session = this._openRequests[requestID].session;
		var request = this._openRequests[requestID].request;
		this.controller.addRequestToGraph(session.getRootRequest(), request);
		this._archiveRequest(session.id, request);
		delete this._openRequests[requestID];
	}
}

MonitoringService.prototype.onRequestError = function(requestID, error) {
	if(this.shouldBeMonitored(requestID)) {
		console.log("Request error: " + error);
		console.log(this._openRequests[requestID].request);
		delete this._openRequests[requestID];
	}
}

MonitoringService.prototype.addRequestToSession = function(httpRequest, tabID) {
	if(httpRequest.type == HttpRequest.Type.ROOT) {
		var session = new Session(this.sessionIncrement++, httpRequest);
		this._monitorTabSession(tabID, session);
	}
	else {
		var session = this._getTabSession(tabID);
		session.addEmbeddedRequest(httpRequest);
	}
	return session;
}

MonitoringService.prototype._archiveRequest = function(sessionID, request) {
	this.controller.storeRequest(sessionID, request);
}

MonitoringService.prototype._archiveRedirect = function(sessionID, redirect) {
	this.controller.storeRedirect(sessionID, redirect);
}

MonitoringService.prototype._isTabMonitored = function(tabID) {
	return (tabID in this._tabSessionMap);
}

MonitoringService.prototype._monitorTabSession = function(tabID, launchedSession) {
	this._tabSessionMap[tabID] = {'session': launchedSession};
}

MonitoringService.prototype._getTabSession = function(tabID) {
	if(tabID in this._tabSessionMap) return this._tabSessionMap[tabID].session;
	else return null;
}
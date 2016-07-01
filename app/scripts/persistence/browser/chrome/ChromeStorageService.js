"use strict";

function ChromeStorageService(storageEndpoint, downloader) {
	this.requestsNo = 0;
	this.redirectsNo = 0;

	this.requestID = "request-";
	this.redirectID = "redirect-";

	this.storageEndpoint = storageEndpoint;
	this.downloader = downloader;

	this.maxBatchSize = 200000000;		/* 400 MB limit (for UTF-16 encoded strings) */

	this.clearStorage();
}

ChromeStorageService.prototype.setController = function(controller) {
	this.controller = controller;
}

ChromeStorageService.prototype.clearStorage = function() {
	this.storageEndpoint.clear();
}

ChromeStorageService.prototype.storeRequest = function(sessionID, request) {
	var id = this.requestID + this.requestsNo;
	var requestToStore = {};
	requestToStore[id] = {'sessionID': sessionID, 'request': request};
	this.storageEndpoint.set(requestToStore, function() {
		if (chrome.runtime.lastError) {
			throw new Error("Error while trying to write to Chrome storage:" + chrome.runtime.lastError.message);
		}
	});
	this.requestsNo++;
}

ChromeStorageService.prototype.storeRedirect = function(sessionID, redirect) {
	var id = this.redirectID + this.redirectsNo;
	var redirectToStore = {};
	redirectToStore[id] = {'sessionID': sessionID, 'redirect': redirect};
	this.storageEndpoint.set(redirectToStore, function() {
		if (chrome.runtime.lastError) {
			throw new Error("Error while trying to write to Chrome storage:" + chrome.runtime.lastError.message);
		}
	});
	this.redirectsNo++;
}

ChromeStorageService.prototype.extractData = function() {
	this.controller.showLoader();
	if(this.redirectsNo > 0) {
		this._extractRedirect(0, this.redirectsNo, Converter.getRedirectColumnValuesCSV(), 1);
	}
	if(this.requestsNo > 0) {
		this._extractRequest(0, this.requestsNo, Converter.getRequestsColumnValuesCSV(), 1);
	}
}

ChromeStorageService.prototype._extractRequest = function(index, topLimit, requestData, batch) {
	var fileName = "requests." + batch + ".csv";
	var storageService = this;
	if(index < topLimit && requestData.length < storageService.maxBatchSize) {
		this.storageEndpoint.get((this.requestID + index), function(result) {
			var data = result[Object.keys(result)[0]];
			requestData += Converter.requestToCSV(data.sessionID, data.request); 
			storageService._extractRequest(index+1, topLimit, requestData, batch);
		});
	}
	else {
		this.downloader.saveFileAs(requestData, "text/csv", fileName);
		if((index+1) < topLimit) this._extractRequest(index+1, topLimit, Converter.getRequestsColumnValuesCSV(), batch+1);
		else this.controller.hideLoader();
	}
}

ChromeStorageService.prototype._extractRedirect = function(index, topLimit, redirectsData, batch) {
	var fileName = "redirects." + batch + ".csv";
	var storageService = this;
	if(index < topLimit && redirectsData.length < storageService.maxBatchSize) {
		this.storageEndpoint.get((this.redirectID + index), function(result) {
			var data = result[Object.keys(result)[0]];
			redirectsData += Converter.redirectToCSV(data.sessionID, data.redirect);
			storageService._extractRedirect(index+1, topLimit, redirectsData, batch);
		});
	}
	else {
		this.downloader.saveFileAs(redirectsData, "text/csv", fileName);
		if((index+1) < topLimit) this._extractRedirect(index+1, topLimit, Converter.getRedirectColumnValuesCSV(), batch+1);
	}
}

ChromeStorageService.prototype.extractGraph = function(graph) {
	this.controller.showLoader();
	this._extractDomains(graph.getDomainNodes());
	this._extractCookies(graph.getDomainNodes());
	this._extractRootRequests(graph.getDomainNodes());
	this._extractEdges(graph.getDomainEdges());
	this.controller.hideLoader();
}

ChromeStorageService.prototype._extractDomains = function(nodes) {
	var fileIndex = 1;
	var nodesData = Converter.getDomainsColumnValuesCSV();
	for(var i = 0; i < nodes.length; i++) {
		nodesData += Converter.domainToCSV(nodes[i]);
		if((nodesData.length >= this.maxBatchSize)) {
			var fileName = "domains." + fileIndex + ".csv";
			this.downloader.saveFileAs(nodesData, "text/csv", fileName);
			nodesData = Converter.getDomainsColumnValuesCSV();;
			fileIndex++;
		}
	}
	var fileName = "domains." + fileIndex + ".csv";
	this.downloader.saveFileAs(nodesData, "text/csv", fileName);
}

ChromeStorageService.prototype._extractCookies = function(nodes) {
	var fileIndex = 1;
	var cookiesData = Converter.getCookiesColumnValuesCSV();
	for(var i = 0; i < nodes.length; i++) {
		var nodeRequests = nodes[i].getRequests();
		for(var j = 0; j < nodeRequests.length; j++) {
			var request = nodeRequests[j], cookies = [];
			for(var key in request.cookies) {
				cookies.push({
					'key': key,
					'value': request.cookies[key],
					'type': (request.type == HttpRequest.Type.ROOT) ? "FIRST PARTY" : "THIRD_PARTY"
				});
			}

			for (var k = 0; k < cookies.length; k++) {
				cookiesData += Converter.cookieToCSV(request, cookies[k]);
				if (cookiesData.length >= this.maxBatchSize) {
					var fileName = "cookies." + fileIndex + ".csv";
					this.downloader.saveFileAs(cookiesData, "text/csv", fileName);
					cookiesData = Converter.getCookiesColumnValuesCSV();
					fileIndex++;
				}
			}
		}
	}
	var fileName = "cookies." + fileIndex + ".csv";
	this.downloader.saveFileAs(cookiesData, "text/csv", fileName);
}

ChromeStorageService.prototype._extractRootRequests = function(nodes) {
	var fileIndex = 1;
	var rootRequestsData = Converter.getRootRequestsColumnValuesCSV();
	for(var i = 0; i < nodes.length; i++) {
		var requests = nodes[i].getRequests();
		for(var j = 0; j < requests.length; j++) {
			if(requests[j].type == HttpRequest.Type.ROOT) rootRequestsData += Converter.rootRequestToCSV(requests[j]);

			if(rootRequestsData.length >= this.maxBatchSize) {
				var fileName = "rootRequests." + fileIndex + ".csv";
				this.downloader.saveFileAs(rootRequestsData, "text/csv", fileName);
				rootRequestsData = Converter.getRootRequestsColumnValuesCSV();
				fileIndex++;
			}
		}
	}
	var fileName = "rootRequests." + fileIndex + ".csv";
	this.downloader.saveFileAs(rootRequestsData, "text/csv", fileName);
}

ChromeStorageService.prototype._extractEdges = function(edges) {
	var fileIndex = 1;
	var edgesData = Converter.getEdgesColumnValuesCSV();
	for(var i = 0; i < edges.length; i++) {
		var requests = edges[i].getRequests(), redirects = edges[i].getRedirects(), referrals = edges[i].getReferrals(), links = [];
		for(var j = 0; j < requests.length; j++) links.push({from: requests[j].from, request: requests[j].request, type: "REQUEST"});
		for(var j = 0; j < redirects.length; j++) links.push({redirect: redirects[j], type: "REDIRECT"});
		for(var j = 0; j < referrals.length; j++) links.push({from: referrals[j].from, request: referrals[j].request, type: "REFERRAL"});
		
		for(var j = 0; j < links.length; j++) {
			edgesData += Converter.edgeToCSV(links[j]);
			if(edgesData.length >= this.maxBatchSize) {
				var fileName = "edges." + fileIndex + ".csv";
				this.downloader.saveFileAs(edgesData, "text/csv", fileName);
				edgesData = Converter.getEdgesColumnValuesCSV();
				fileIndex++;
			}
		}
	}
	var fileName = "edges." + fileIndex + ".csv";
	this.downloader.saveFileAs(edgesData, "text/csv", fileName);
}
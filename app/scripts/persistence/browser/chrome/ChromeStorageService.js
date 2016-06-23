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
	this._extractNodes(graph.getNodes());
	this._extractEdges(graph.getEdges());
	this.controller.hideLoader();
}

ChromeStorageService.prototype._extractNodes = function(nodes) {
	var fileIndex = 1;
	var nodesData = Converter.getNodesColumnValuesCSV();
	for(var i = 0; i < nodes.length; i++) {
		nodesData += Converter.nodeToCSV(nodes[i]);
		if((nodesData.length >= this.maxBatchSize) || (i == nodes.length-1)) {
			var fileName = "nodes." + fileIndex + ".csv";
			this.downloader.saveFileAs(nodesData, "text/csv", fileName);
			nodesData = Converter.getNodesColumnValuesCSV();;
			fileIndex++;
		}
	}
}

ChromeStorageService.prototype._extractEdges = function(edges) {
	var fileIndex = 1;
	var edgesData = Converter.getEdgesColumnValuesCSV();
	for(var i = 0; i < edges.length; i++) {
		edgesData += Converter.edgeToCSV(edges[i]);
		if((edgesData.length >= this.maxBatchSize) || (i == edges.length-1)) {
			var fileName = "edges." + fileIndex + ".csv";
			this.downloader.saveFileAs(edgesData, "text/csv", fileName);
			edgesData = Converter.getEdgesColumnValuesCSV();
			fileIndex++;
		}
	}
}
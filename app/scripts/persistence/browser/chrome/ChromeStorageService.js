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

ChromeStorageService.prototype.clearStorage = function() {
	this.storageEndpoint.clear();
}

ChromeStorageService.prototype.storeRequest = function(sessionID, request) {
	var id = this.requestID + this.requestsNo;
	var requestToStore = {};
	requestToStore[id] = {'sessionID': sessionID, 'request': request};
	this.storageEndpoint.set(requestToStore, function() {
		if (chrome.runtime.lastError) {
			console.log("Error while trying to write to Chrome storage:" + id);
			console.log(chrome.runtime.lastError.message);
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
			console.log("Error while trying to write to Chrome storage:" + id);
			console.log(chrome.runtime.lastError.message);
		}
	});
	this.redirectsNo++;
}

ChromeStorageService.prototype.extractData = function() {
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
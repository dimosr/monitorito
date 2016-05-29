"use strict";

function ChromeStorageService(storageEndpoint, downloader) {
	this.sessionsNo = 0;
	this.redirectsNo = 0;

	this.sessionID = "session-";
	this.redirectID = "redirect-";

	this.storageEndpoint = storageEndpoint;
	this.downloader = downloader;

	this.maxBatchSize = 200000000;		/* 400 MB limit (for UTF-16 encoded strings) */

	this.clearStorage();
}

ChromeStorageService.prototype.clearStorage = function() {
	this.storageEndpoint.clear();
}

ChromeStorageService.prototype.storeSession = function(session) {
	var id = this.sessionID + this.sessionsNo;
	var sessionToStore = {};
	sessionToStore[id] = session;
	this.storageEndpoint.set(sessionToStore, function() {
		if (chrome.runtime.lastError) {
			console.log("Error while trying to write to Chrome storage:" + id);
			console.log(chrome.runtime.lastError.message);
		}
	});
	this.sessionsNo++;
}

ChromeStorageService.prototype.storeRedirect = function(redirect) {
	var id = this.redirectID + this.redirectsNo;
	var redirectToStore = {};
	redirectToStore[id] = redirect;
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
	if(this.sessionsNo > 0) {
		this._extractSession(0, this.sessionsNo, Converter.getRequestsColumnValuesCSV(), 1);
	}
}

ChromeStorageService.prototype._extractSession = function(index, topLimit, requestsData, batch) {
	var fileName = "requests." + batch + ".csv";
	var storageService = this;
	if(index < topLimit && requestsData.length < storageService.maxBatchSize) {
		this.storageEndpoint.get((this.sessionID + index), function(result) {
			var session = result[Object.keys(result)[0]];
			var sessionID = Object.keys(result)[0].replace(storageService.sessionID, "");
			requestsData += Converter.sessionToCSV(sessionID, session); 
			storageService._extractSession(index+1, topLimit, requestsData, batch);
		});
	}
	else {
		this.downloader.saveFileAs(requestsData, "text/csv", fileName);
		if((index+1) < topLimit) this._extractSession(index+1, topLimit, Converter.getRequestsColumnValuesCSV(), batch+1);
	}
}

ChromeStorageService.prototype._extractRedirect = function(index, topLimit, redirectsData, batch) {
	var fileName = "redirects." + batch + ".csv";
	var storageService = this;
	if(index < topLimit && redirectsData.length < storageService.maxBatchSize) {
		this.storageEndpoint.get((this.redirectID + index), function(result) {
			var redirect = result[Object.keys(result)[0]];
			redirectsData += Converter.redirectToCSV(redirect);
			storageService._extractRedirect(index+1, topLimit, redirectsData, batch);
		});
	}
	else {
		this.downloader.saveFileAs(redirectsData, "text/csv", fileName);
		if((index+1) < topLimit) this._extractRedirect(index+1, topLimit, Converter.getRedirectColumnValuesCSV(), batch+1);
	}
}
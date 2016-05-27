"use strict";

function ChromeStorageService(storageEndpoint) {
	this.sessionsNo = 0;
	this.redirectsNo = 0;

	this.sessionID = "session-";
	this.redirectID = "redirect-";

	this.storageEndpoint = storageEndpoint;

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

ChromeStorageService.prototype.extractData = function(callbackFunction) {
	var storageService = this;
	if(this.redirectsNo > 0) {
		var redirectsData = Converter.createCSVRow(["From", "To", "Type", "Timestamp"]);
		for(var i = 0; i < this.redirectsNo-1; i++) {
			storageService.storageEndpoint.get((this.redirectID + i), function(result) {
				var redirect = result[Object.keys(result)[0]];
				redirectsData += Converter.redirectToCSV(redirect);
			});
		}
		storageService.storageEndpoint.get((this.redirectID + (this.redirectsNo-1)), function(result) {
			var redirect = result[Object.keys(result)[0]];
			redirectsData += Converter.redirectToCSV(redirect);
			saveAs(new Blob([redirectsData], {type: "text/csv"}), "redirects.csv");
		});
	}

	if(this.sessionsNo > 0) {
		var requestsData = Converter.createCSVRow(["SessionID", "Method", "URL", "Timestamp", "Body Parameters", "Type"]);
		for(var i = 0; i < this.sessionsNo-1; i++) {
			storageService.storageEndpoint.get((this.sessionID + i), function(result) {
				var session = result[Object.keys(result)[0]];
				var sessionID = Object.keys(result)[0].replace(storageService.sessionID, "");

				var rootRequest = session._rootRequest;
				requestsData += Converter.requestToCSV(sessionID, rootRequest);
				for(var j = 0; j < session._embeddedRequests.length; j++) {
					requestsData += Converter.requestToCSV(sessionID, session._embeddedRequests[j]);
				}
			});
		}
		storageService.storageEndpoint.get((this.sessionID + (this.sessionsNo-1)), function(result) {
			var session = result[Object.keys(result)[0]];
			var sessionID = Object.keys(result)[0].replace(storageService.sessionID, "");

			var rootRequest = session._rootRequest;
			requestsData += Converter.requestToCSV(sessionID, rootRequest);
			for(var j = 0; j < session._embeddedRequests.length; j++) {
				requestsData += Converter.requestToCSV(sessionID, session._embeddedRequests[j]);
			}
			saveAs(new Blob([requestsData], {type: "text/csv"}), "requests.csv");
		});
	}
}


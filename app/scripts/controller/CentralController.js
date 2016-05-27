"use strict";

function CentralController(interfaceHandler, monitoringService, graphHandler, storageService) {
	this.interfaceHandler = interfaceHandler;
	this.monitoringService = monitoringService;
	this.graphHandler = graphHandler;
	this.storageService = storageService;
}

CentralController.prototype.addRequestToGraph = function(httpRootRequest, httpCurrentRequest) {
	this.graphHandler.addRequest(httpRootRequest, httpCurrentRequest);
}

CentralController.prototype.addRedirectToGraph = function(redirect) {
	this.graphHandler.addRedirect(redirect);
}

CentralController.prototype.enableMonitoring = function() {
	this.monitoringService.enable();
}

CentralController.prototype.disableMonitoring = function() {
	this.monitoringService.disable();
}

CentralController.prototype.extractMonitoredData = function() {
	this.monitoringService.archiveRemainingData();
	this.storageService.extractData();
}

CentralController.prototype.getGraphStatistics = function() {
	return this.graphHandler.getGraphStatistics();
}

CentralController.prototype.getGraphNodeMetrics = function(node) {
	return this.graphHandler.getGraphNodeMetrics(node);
}

CentralController.prototype.disableGraphPhysics = function() {
	this.graphHandler.disableGraphPhysics();
}

CentralController.prototype.enableGraphPhysics = function() {
	this.graphHandler.enableGraphPhysics();
}

CentralController.prototype.storeSession = function(session) {
	this.storageService.storeSession(session);
}

CentralController.prototype.storeRedirect = function(redirect) {
	this.storageService.storeRedirect(redirect);
}
"use strict";

function CentralController(interfaceHandler, monitoringService, graphHandler) {
	this.interfaceHandler = interfaceHandler;
	this.monitoringService = monitoringService;
	this.graphHandler = graphHandler;
}

CentralController.prototype.addRequestToGraph = function(httpRootRequest, httpCurrentRequest) {
	this.graphHandler.addRequest(httpRootRequest, httpCurrentRequest);
}

CentralController.prototype.addRedirectToGraph = function(redirect) {
	this.graphHandler.addRedirect(redirect);
}

CentralController.prototype.setFirstPartyDomainsToUI = function(domainsNumber) {
	this.interfaceHandler.setFirstPartyDomains(domainsNumber);
}

CentralController.prototype.setThirdPartyDomainsToUI = function(domainsNumber) {
	this.interfaceHandler.setThirdPartyDomains(domainsNumber);
}
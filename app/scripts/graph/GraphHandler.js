"use strict";

function GraphHandler(graph) {
	this.graph = graph;

	this._FirstPartyDomains = 0;
	this._ThirdPartyDomains = 0;
}

GraphHandler.prototype.setController = function(controller) {
	this.controller = controller;
}

GraphHandler.prototype.addRequest = function(rootRequest, request) {
	if(!this.graph.existsNode(Util.getUrlHostname(request.url))) {
		this.graph.createNode(Util.getUrlHostname(request.url), request.type);
		if(request.type == HttpRequest.Type.ROOT) this.increaseFirstPartyDomains();
		else this.increaseThirdPartyDomains();
	}
	this.graph.addRequestToNode(request);

	if( Util.getUrlHostname(rootRequest.url) != Util.getUrlHostname(request.url) ) {
		if(!this.graph.existsEdge(Util.getUrlHostname(rootRequest.url), Util.getUrlHostname(request.url), Edge.Type.REQUEST)) {
			this.graph.createEdge(Util.getUrlHostname(rootRequest.url), Util.getUrlHostname(request.url), Edge.Type.REQUEST);
		}
		this.graph.addRequestToEdge(rootRequest.url, request.url);
	}
}

GraphHandler.prototype.addRedirect = function(redirect) {
	var fromHostname = Util.getUrlHostname(redirect.getInitialURL());
	var toHostname = Util.getUrlHostname(redirect.getFinalURL());
	if(!this.graph.existsEdge(fromHostname, toHostname, Edge.Type.REDIRECT)) {
		this.graph.createEdge(fromHostname, toHostname, Edge.Type.REDIRECT);
	}
	this.graph.addRequestToEdge(redirect.getInitialURL(), redirect.getFinalURL());

}

GraphHandler.prototype.addSelectNodeListener = function(callbackFunction) {
	this.graph.onSelectNode(callbackFunction);
}

GraphHandler.prototype.addSelectEdgeListener = function(callbackFunction) {
	this.graph.onSelectEdge(callbackFunction);
}

GraphHandler.prototype.addDeselectNodeListener = function(callbackFunction) {
	this.graph.onDeselectNode(callbackFunction);
}

GraphHandler.prototype.addDeselectEdgeListener = function(callbackFunction) {
	this.graph.onDeselectEdge(callbackFunction);
}

GraphHandler.prototype.increaseFirstPartyDomains = function() {
	this._FirstPartyDomains++;
	this.controller.setFirstPartyDomainsToUI(this._FirstPartyDomains);
}

GraphHandler.prototype.increaseThirdPartyDomains = function() {
	this._ThirdPartyDomains++;
	this.controller.setThirdPartyDomainsToUI(this._ThirdPartyDomains);
}
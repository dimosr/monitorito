"use strict";

function GraphHandler(graphStatsCalculator) {
	this.graphStatsCalculator = graphStatsCalculator;

	this._FirstPartyDomains = 0;
	this._ThirdPartyDomains = 0;
}

GraphHandler.prototype.setGraph = function(graph) {
	this.graph = graph;
	this.graph.register(this.graphStatsCalculator);
}

GraphHandler.prototype.setController = function(controller) {
	this.controller = controller;
}

GraphHandler.prototype.getGraphStatistics = function() {
	return this.graphStatsCalculator.getStatistics();
}

GraphHandler.prototype.getGraphNodeMetrics = function(node) {
	return this.graphStatsCalculator.getNodeMetrics(node);
}

GraphHandler.prototype.disableGraphPhysics = function() {
	this.graph.disablePhysics();
}

GraphHandler.prototype.enableGraphPhysics = function() {
	this.graph.enablePhysics();
}

GraphHandler.prototype.addResource = function(rootRequest, request) {
	if(!this.graph.existsResourceNode(request.url)) {
		this.graph.createResourceNode(request.url);
		this.addResourceToDomain(request.url, Util.getUrlHostname(request.url));
	}
	this.graph.addRequestToResourceNode(request);
	if(request.type == HttpRequest.Type.EMBEDDED) this.graph.createResourcesEdge(rootRequest.url, request.url, Edge.Type.REQUEST);
}

GraphHandler.prototype.addResourceToDomain = function(URL, domain) {
	if(!this.graph.existsDomainNode(domain)) this.graph.createDomainNode(domain);
	this.graph.createDomainEdge(URL, domain);
}

GraphHandler.prototype.addRedirect = function(redirect) {
	if(!this.graph.existsResourceNode(redirect.getFinalURL()) ) {
		this.graph.createResourceNode(redirect.getFinalURL());
		this.addResourceToDomain(redirect.getFinalURL(), Util.getUrlHostname(redirect.getFinalURL()));
	}
	this.graph.createResourcesEdge(redirect.getInitialURL(), redirect.getFinalURL(), Edge.Type.REDIRECT);
	/*var fromHostname = Util.getUrlHostname(redirect.getInitialURL());
	var toHostname = Util.getUrlHostname(redirect.getFinalURL());
	if(!this.graph.existsEdge(fromHostname, toHostname, Edge.Type.REDIRECT)) {
		this.graph.createEdge(fromHostname, toHostname, Edge.Type.REDIRECT);
	}
	this.graph.addRequestToEdge(redirect.getInitialURL(), redirect.getFinalURL());
	*/
}

GraphHandler.prototype.addReferral = function(sourceURL, destinationURL, rootURL) {
	if(!this.graph.existsResourceNode(sourceURL) ) {
		this.graph.createResourceNode(sourceURL);
		this.addResourceToDomain(sourceURL, Util.getUrlHostname(sourceURL));
	}
	this.graph.createResourcesEdge(sourceURL, destinationURL, Edge.Type.REFERRAL);
	this.graph.removeResourcesEdge(rootURL, destinationURL, Edge.Type.REQUEST)
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
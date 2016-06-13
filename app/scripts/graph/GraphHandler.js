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

GraphHandler.prototype.addRequest = function(rootRequest, request) {
	this._ensureNodeExists(Util.getUrlHostname(request.url));
	this.graph.addRequestToNode(request);

	if(request.hasReferer() && Util.getUrlHostname(request.getReferer()) != Util.getUrlHostname(request.url)) {
		this._ensureNodeExists(Util.getUrlHostname(request.getReferer()));
		this._ensureEdgeExists(Util.getUrlHostname(request.getReferer()), Util.getUrlHostname(request.url));
		this.graph.addReferralToEdge(request.getReferer(), request.url);
	}
	else {
		this._ensureNodeExists(Util.getUrlHostname(rootRequest.url));
		if(request.type != HttpRequest.Type.ROOT && Util.getUrlHostname(rootRequest.url) != Util.getUrlHostname(request.url)) {
			this._ensureEdgeExists(Util.getUrlHostname(rootRequest.url), Util.getUrlHostname(request.url));
			this.graph.addRequestToEdge(rootRequest.url, request.url);
		}
	}
}

GraphHandler.prototype.addRedirect = function(redirect) {
	if(Util.getUrlHostname(redirect.getInitialURL()) != Util.getUrlHostname(redirect.getFinalURL())) {
		var fromHostname = Util.getUrlHostname(redirect.getInitialURL());
		var toHostname = Util.getUrlHostname(redirect.getFinalURL());
		this._ensureNodeExists(fromHostname);
		this._ensureNodeExists(toHostname);
		this._ensureEdgeExists(fromHostname, toHostname);
		this.graph.addRedirectToEdge(redirect.getInitialURL(), redirect.getFinalURL());
	}
}

GraphHandler.prototype._ensureNodeExists = function(domain) {
	if(!this.graph.existsNode(domain)) this.graph.createNode(domain);
}

GraphHandler.prototype._ensureEdgeExists = function(fromDomain, toDomain) {
	if(!this.graph.existsEdge(fromDomain, toDomain)) this.graph.createEdge(fromDomain, toDomain);
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
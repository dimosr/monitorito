function GraphController(graph, interfaceHandler) {
	this.graph = graph;
	this.interfaceHandler = interfaceHandler;

	this._FirstPartyDomains = 0;
	this._ThirdPartyDomains = 0;
}

GraphController.prototype.addRequest = function(rootRequest, request) {
	if(!this.graph.existsNode(request.getHostname())) {
		this.graph.createNode(request.getHostname(), request.type);
		if(request.type == HttpRequest.Type.ROOT) this.increaseFirstPartyDomains();
		else this.increaseThirdPartyDomains();
	}
	this.graph.addRequestToNode(request);

	if(rootRequest.getHostname() != request.getHostname()) {
		if(!this.graph.existsEdge(rootRequest.getHostname(), request.getHostname(), Edge.Type.REQUEST)) {
			this.graph.createEdge(rootRequest.getHostname(), request.getHostname(), Edge.Type.REQUEST);
		}
		this.graph.addLinkToEdge(rootRequest.url, request.url);
	}
}

GraphController.prototype.addRedirect = function(redirect) {
	var fromHostname = Util.getUrlHostname(redirect.getInitialURL());
	var toHostname = Util.getUrlHostname(redirect.getFinalURL());
	if(!this.graph.existsEdge(fromHostname, toHostname, Edge.Type.REDIRECT)) {
		this.graph.createEdge(fromHostname, toHostname, Edge.Type.REDIRECT);
	}
	this.graph.addLinkToEdge(redirect.getInitialURL(), redirect.getFinalURL());

}

GraphController.prototype.addSelectNodeListener = function(callbackFunction) {
	this.graph.onSelectNode(callbackFunction);
}

GraphController.prototype.addSelectEdgeListener = function(callbackFunction) {
	this.graph.onSelectEdge(callbackFunction);
}

GraphController.prototype.addDeselectNodeListener = function(callbackFunction) {
	this.graph.onDeselectNode(callbackFunction);
}

GraphController.prototype.addDeselectEdgeListener = function(callbackFunction) {
	this.graph.onDeselectEdge(callbackFunction);
}

GraphController.prototype.increaseFirstPartyDomains = function() {
	this._FirstPartyDomains++;
	this.interfaceHandler.setFirstPartyDomains(this._FirstPartyDomains);
}

GraphController.prototype.increaseThirdPartyDomains = function() {
	this._ThirdPartyDomains++;
	this.interfaceHandler.setThirdPartyDomains(this._ThirdPartyDomains);
}
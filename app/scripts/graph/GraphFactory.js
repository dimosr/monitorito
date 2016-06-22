"use strict";

/* Graph Factory: using visJS for instantiating the visualisation network */

function GraphFactory() {}

GraphFactory.prototype.buildGraph = function(mode, graphElement) {
	if(graphElement != null && mode == Graph.Mode.ONLINE) {
		var visNetwork = new VisualisationNetwork(graphElement);
	    return new Graph(visNetwork);
	}
	else if(graphElement == null && mode == Graph.Mode.OFFLINE) {
		return new Graph(null);
	}
	else {
		throw new Error("Cannot build Graph: mode is not complying with value of graph Element");
	}
}
"use strict";

function Graph(visualisationNetwork) {
	this._nodesAutoIncrement = 0;
	this._edgesAutoIncrement = 0;
	this._graph = {};
	this._observers = [];

	if(visualisationNetwork != null) {
		this.buildGraphWithVisualisation(visualisationNetwork);
		this.mode = Graph.Mode.ONLINE;
	}
	else this.mode = Graph.Mode.OFFLINE;
}

Graph.prototype.buildGraphWithVisualisation = function(visualisationNetwork) {
	this._network = visualisationNetwork;
	this._network.nodes = [];
	this._network.edges = [];

	this._setupListeners();
	this._network._selectEdgeCallback = function(selectedEdge){};
	this._network._selectNodeCallback = function(selectedNode){};
	this._network._deselectEdgeCallback = function(deselectedEdges){};
	this._network._deselectNodeCallback = function(deselectedNodes){};
}



Graph.prototype.disablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: disablePhysics() called for graph without visualisation");
	else this._network.setOptions({physics: {enabled: false}});
}

Graph.prototype.enablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: enablePhysics() called for graph without visualisation");
	else this._network.setOptions({physics: {enabled: true}});
}

Graph.prototype.notifyForNewNode = function(node) {
	for(var i=0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onNewNode(node);
	}
}

Graph.prototype.notifyForNewEdge = function(fromNode, toNode, edge) {
	for(var i=0; i < this._observers.length; i++) {
		var observer = this._observers[i];
		observer.onNewEdge(fromNode, toNode, edge);
	}
}

Graph.prototype.createEdge = function(fromHostname, toHostname, edgeType) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	var edge = new Edge(this._edgesAutoIncrement, edgeType, fromNode, toNode);
	this._edgesAutoIncrement++;
	if(this.mode == Graph.Mode.ONLINE) this._addEdgeToNetwork(edge);

	fromNode.addEdgeTo(toNode, edge);
	toNode.addEdgeFrom(fromNode, edge);

	this.notifyForNewEdge(fromNode, toNode, edge);
}

Graph.prototype.addRequestToEdge = function(fromURL, toURL) {
	var fromNode = this.getNode(Util.getUrlHostname(fromURL));
	var toNode = this.getNode(Util.getUrlHostname(toURL));
	var edge = fromNode.getEdgeTo(toNode);
	edge.addRequest(fromURL, toURL);
}

Graph.prototype.getEdge = function(fromHostname, toHostname, edgeType) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	if(!fromNode.hasEdgeTo(toNode)) return null;
	else {
		var edge = fromNode.getEdgeTo(toNode);
		if(edge.getType() == edgeType) return edge;
		else return null;
	}
}

Graph.prototype.existsEdge = function(fromHostname, toHostname, edgeType) {
	return this.getEdge(fromHostname, toHostname, edgeType) != null;
}

Graph.prototype.createNode = function(hostname, requestType) {
	var node = new Node(this._nodesAutoIncrement, requestType, hostname);
	this._graph[hostname] = node;
	this._nodesAutoIncrement++;
	if(this.mode == Graph.Mode.ONLINE) this._addNodeToNetwork(node);

	this.notifyForNewNode(node);
}

Graph.prototype.addRequestToNode = function(request) {
	var node = this._graph[Util.getUrlHostname(request.url)];
	node.addRequest(request);
}

Graph.prototype.getNode = function(hostname) {
	return this._graph[hostname];
}

Graph.prototype.existsNode = function(hostname) {
	return hostname in this._graph;
}

Graph.prototype.onSelectNode = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onSelectNode() called for graph without visualisation");
	else this._network._selectNodeCallback = callbackFunction;
}

Graph.prototype.onSelectEdge = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onSelectEdge() called for graph without visualisation");
	else this._network._selectEdgeCallback = callbackFunction;
}

Graph.prototype.onDeselectNode = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onDeselectNode() called for graph without visualisation");
	else this._network._deselectNodeCallback = callbackFunction;
}

Graph.prototype.onDeselectEdge = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onDeselectEdge() called for graph without visualisation");
	else this._network._deselectEdgeCallback = callbackFunction;
}

Graph.prototype._setupListeners = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: _setupListeners() called for graph without visualisation");
	else {
		this._network.on("select", function(eventParams) {
			if(eventParams.nodes.length == 1) {//Node Selected
				var selectedNode = this.nodes[eventParams.nodes[0]];
				this._selectNodeCallback(selectedNode);
			}
			else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1) {//Edge Selected
				var selectedEdge = this.edges[eventParams.edges[0]];
				this._selectEdgeCallback(selectedEdge);
			}
		});

		this._network.on("deselectNode", function(eventParams) {
			var previousSelection = eventParams.previousSelection;
			if(previousSelection.nodes.length == 1) {//Only in node deselections
				var deselectedNodes = previousSelection.nodes;
				this._deselectNodeCallback(deselectedNodes);
			}
		});

		this._network.on("deselectEdge", function(eventParams) {
			var previousSelection = eventParams.previousSelection;
			if(previousSelection.nodes.length == 0 && previousSelection.edges.length == 1) {//Only in edge deselections
				var deselectedEdges = previousSelection.edges;
				this._deselectEdgeCallback(deselectedEdges);
			}
		});
	}
}

Graph.prototype._addNodeToNetwork = function(node) {
	this._network.nodes[this._nodesAutoIncrement] = node;
	this._network.body.data.nodes.add(node.getVizNode());
}

Graph.prototype._addEdgeToNetwork = function(edge) {
	this._network.edges[this._edgesAutoIncrement] = edge;
	this._network.body.data.edges.add(edge.getVizEdge())
}

Graph.prototype.filterNodes = function(callbackFunction) {
	var filteredNodes = [];
	for(var hostnameKey in this._graph) {
		var node = this._graph[hostnameKey];
		if(callbackFunction(node)) filteredNodes.push(node);
	}
	return filteredNodes;
}

Graph.prototype.register = function(observer) {
	this._observers.push(observer);
}

Graph.Mode = {
	ONLINE: "Online",
	OFFLINE: "Offline"
}
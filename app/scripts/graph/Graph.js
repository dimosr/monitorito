"use strict";

function Graph(visualisationNetwork) {
	this.edgesIncrement = 1;
	this._observers = [];

	this.domainNodes = {};
	this.resourceNodes = {};

	if(visualisationNetwork != null) {
		this.buildGraphWithVisualisation(visualisationNetwork);
		this.mode = Graph.Mode.ONLINE;
	}
	else this.mode = Graph.Mode.OFFLINE;
}

Graph.prototype.buildGraphWithVisualisation = function(visualisationNetwork) {
	this._network = visualisationNetwork;
	this._network.nodes = this._network.body.data.nodes._data;
	this._network.edges = this._network.body.data.edges._data;

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

Graph.prototype.register = function(observer) {
	this._observers.push(observer);
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

Graph.prototype.filterNodes = function(callbackFunction) {
	var filteredNodes = [];
	for(var hostnameKey in this._graph) {
		var node = this._graph[hostnameKey];
		if(callbackFunction(node)) filteredNodes.push(node);
	}
	return filteredNodes;
}

Graph.Mode = {
	ONLINE: "Online",
	OFFLINE: "Offline"
}

/* ----- */

Graph.prototype.createResourceNode = function(url) {
	if(!(url in this.resourceNodes)) {
		var node = new ResourceNode(url)
		this.resourceNodes[url] = node;
		this._addNodeToNetwork(node);
	}
}

Graph.prototype.addRequestToResourceNode = function(request) {
	var resourceNode = this.resourceNodes[request.url];
	resourceNode.addRequest(request);
}

Graph.prototype.existsResourceNode = function(url) {
	return url in this.resourceNodes;
}

Graph.prototype.createDomainNode = function(domain) {
	if(!(domain in this.domainNodes)) {
		var node = new DomainNode(domain);
		this.domainNodes[domain] = node;
		this._addNodeToNetwork(node);
	}
}

Graph.prototype.existsDomainNode = function(domain) {
	return domain in this.domainNodes;
}

Graph.prototype.createDomainEdge = function(URL, domain) {
	var domainNode = this.domainNodes[domain];
	var resourceNode = this.resourceNodes[URL];

	domainNode.addInEdge(resourceNode, this.edgesIncrement);
	resourceNode.addOutEdge(domainNode, Edge.Type.DOMAIN, this.edgesIncrement);

	this._addEdgeToNetwork(domainNode, resourceNode, Edge.Type.DOMAIN, this.edgesIncrement++);
}

Graph.prototype.createResourcesEdge = function(sourceURL, destinationURL, edgeType) {
	var sourceNode = this.resourceNodes[sourceURL];
	var destinationNode = this.resourceNodes[destinationURL];

	if(sourceNode === undefined) {
		console.log("source: " + sourceURL + ", destination: " + destinationURL + ", type: " + edgeType.name)
		console.log(this.resourceNodes);
	}
	sourceNode.addOutEdge(destinationNode, edgeType, this.edgesIncrement);
	destinationNode.addInEdge(sourceNode, edgeType, this.edgesIncrement);

	this._addEdgeToNetwork(sourceNode, destinationNode, edgeType, this.edgesIncrement++);		
}

Graph.prototype.removeResourcesEdge = function(sourceURL, destinationURL, edgeType) {
	var sourceNode = this.resourceNodes[sourceURL];
	var destinationNode = this.resourceNodes[destinationURL];

	var edgeID = sourceNode.removeOutEdge(destinationNode, edgeType);
	destinationNode.removeInEdge(sourceNode, edgeType);

	this._removeEdgeFromNetwork(sourceNode, destinationNode, edgeType, edgeID);	
}

Graph.prototype._addNodeToNetwork = function(node) {
	if(this.mode == Graph.Mode.ONLINE) this._network.body.data.nodes.add(node.getVisSettings());
}

Graph.prototype._addEdgeToNetwork = function(fromNode, toNode, edgeType, edgeID) {
	if(this.mode == Graph.Mode.ONLINE) this._network.body.data.edges.add(Edge.getVisSettings(fromNode, toNode, edgeType, edgeID));
}

Graph.prototype._removeEdgeFromNetwork = function(edgeID) {
	this._network.body.data.edges.remove({id: edgeID});
}
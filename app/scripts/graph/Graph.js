function Graph(container, interfaceHandler) {
	this.interfaceHandler = interfaceHandler;

	this._nodesAutoIncrement = 0;
	this._edgesAutoIncrement = 0;
	this._graph = {};
	this._FirstPartyDomains = 0;
	this._ThirdPartyDomains = 0;

	var data = {
		nodes: new vis.DataSet([]),
		edges: new vis.DataSet([])
	};
	var options = Graph.getConfigurationOptions();
	this._network = new vis.Network(container, data, options);
	this._network.nodes = [];
	this._network.edges = [];

	this._network._selectEdgeCallback = function(selectedEdge){};
	this._network._selectNodeCallback = function(selectedNode){};
	this._network._deselectEdgeCallback = function(deselectedEdges){};
	this._network._deselectNodeCallback = function(deselectedNodes){};

	this.setupListeners();
}

Graph.prototype.addRequestNode = function(rootRequest, request) {
	if(!(request.getHostname() in this._graph)) {
		this.createGraphNode(request, rootRequest == request);
	}
	else {
		this.addRequestToNode(request);
	}

	if(rootRequest.getHostname() != request.getHostname()) {
		if(!this.existsEdge(rootRequest.getHostname(), request.getHostname(), Edge.Type.REQUEST)) {
			this.createDependencyEdge(rootRequest, request);
		}
	}
}

Graph.prototype.createGraphNode = function(request, isRootRequest) {
	var nodeType = isRootRequest ? Node.Type.ROOT : Node.Type.EMBEDDED;
	var node = new Node(this._nodesAutoIncrement, nodeType, request.getHostname());
	node.addRequest(request);
	this._addNodeToNetwork(node);

	this._graph[request.getHostname()] = node;
	this._nodesAutoIncrement++;
	if(isRootRequest) this.interfaceHandler.setFirstPartySites(++this._FirstPartyDomains);
	else this.interfaceHandler.setThirdPartySites(++this._ThirdPartyDomains);
}

Graph.prototype.existsEdge = function(fromHostname, toHostname, edgeType) {
	var fromNodeAdjVertices = this._graph[fromHostname].adjacent;
	if(!(toHostname in fromNodeAdjVertices)) return false;
	else {
		var edge = fromNodeAdjVertices[toHostname].edge;
		return edge.type == edgeType;
	}
}

Graph.prototype.createDependencyEdge = function(fromRequest, toRequest) {
	this.createEdge(fromRequest, toRequest, Edge.Type.REQUEST);
}

Graph.prototype.createRedirectEdge = function(fromRequest, toRequest) {
	this.createEdge(fromRequest, toRequest, Edge.Type.REDIRECT);
}

Graph.prototype.createEdge = function(fromRequest, toRequest, edgeType) {
	var fromNode = this._graph[fromRequest.getHostname()];
	var toNode = this._graph[toRequest.getHostname()];
	var edge = new Edge(this._edgesAutoIncrement, edgeType, fromNode, toNode);
	edge.addRequest(fromRequest, toRequest);
	this._addEdgeToNetwork(edge);


	fromNode.addAdjacentNode(toNode, edge);
	this._edgesAutoIncrement++;
}

Graph.prototype.addLinkToEdge = function(fromRequest, toRequest) {
	var fromNode = this._graph[fromRequest.getHostname()];
	var toNode = this._graph[toRequest.getHostname()];
	var edge = fromNode.getEdgeWithAdjacent(toNode);
	edge.addRequest(fromRequest, toRequest);
}

Graph.prototype.addRequestToNode = function(request) {
	var node = this._graph[request.getHostname()];
	node.addRequest(request);
}

Graph.prototype.onSelectNode = function(callbackFunction) {
	this._network._selectNodeCallback = callbackFunction;
}

Graph.prototype.onSelectEdge = function(callbackFunction) {
	this._network._selectEdgeCallback = callbackFunction;
}

Graph.prototype.onDeselectNode = function(callbackFunction) {
	this._network._deselectNodeCallback = callbackFunction;
}

Graph.prototype.onDeselectEdge = function(callbackFunction) {
	this._network._deselectEdgeCallback = callbackFunction;
}

Graph.prototype.setupListeners = function() {
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

Graph.prototype.getNode = function(ID) {
	return this._network.nodes[ID];
}

Graph.prototype.getEdge = function(ID) {
	return this._network.edges[ID];
}

Graph.prototype._addNodeToNetwork = function(node) {
	this._network.nodes[this._nodesAutoIncrement] = node;
	this._network.body.data.nodes.add(node.vizNode);
}

Graph.prototype._addEdgeToNetwork = function(edge) {
	this._network.edges[this._edgesAutoIncrement] = edge;
	this._network.body.data.edges.add(edge.vizEdge)
}

Graph.getConfigurationOptions = function() {
	return {
		edges: {
			smooth: false
		},
		interaction: {
			tooltipDelay: 0
		},
		physics: {
			barnesHut: {
				gravitationalConstant: -14000,
				centralGravity: 0,
				springLength: 250,
				springConstant: 0.1,
				avoidOverlap: 0.5
			},
			solver: "barnesHut"
		}
	};
}
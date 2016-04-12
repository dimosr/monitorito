function Graph(container, options) {
	this._nodesAutoIncrement = 1;
	this._edgesAutoIncrement = 1;
	this._graph = {};

	var data = {
		nodes: new vis.DataSet([]),
		edges: new vis.DataSet([])
	};
	this._network = new vis.Network(container, data, options);
	this._network.nodes = data.nodes;
	this._network.edges = data.edges;

	this._network._selectEdgeCallback = function(selectedEdge){};
	this._network._selectNodeCallback = function(selectedNode){};
	this._network._deselectEdgeCallback = function(deselectedEdges){};
	this._network._deselectNodeCallback = function(deselectedNodes){};

	this.setupListeners();
}

Graph.EdgeType = {
	REQUEST: "dependency",
	REDIRECT: "redirection",
}

Graph.prototype.addRequestNode = function(rootRequest, request) {
	if(!(request.getHostname() in this._graph)) {
		this.createGraphNode(request, rootRequest == request);
	}
	else {
		this.addRequestToNode(request);
	}

	if(rootRequest.getHostname() != request.getHostname()) {
		if(!this.existsEdge(rootRequest.getHostname(), request.getHostname(), Graph.EdgeType.REQUEST)) {
			this.createDependencyEdge(rootRequest, request);
		}
	}
}

Graph.prototype.createGraphNode = function(request, isRootRequest) {
	var nodeSize = isRootRequest ? 40 : 20;
	var faviconURL = "http://www.google.com/s2/favicons?domain=" + request.getHostname();
	this._network.nodes.add({
		id: this._nodesAutoIncrement, 
		shape: 'circularImage', 
		size: nodeSize, 
		image: faviconURL,
		brokenImage: 'resources/img/default_node_img.jpg', 
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: request.getHostname(),
		requests: [request]
	});
	this._graph[request.getHostname()] = {ID: this._nodesAutoIncrement, adjacent: {}};
	this._nodesAutoIncrement++;
	if(isRootRequest) increaseFirstPartySites();
	else increaseThirdPartySites();
}

Graph.prototype.existsEdge = function(fromHostname, toHostname, edgeType) {
	var fromNodeAdjVertices = this._graph[fromHostname].adjacent;
	if(!(toHostname in fromNodeAdjVertices)) return false;
	else {
		var edgeID = fromNodeAdjVertices[toHostname].edge;
		var edge = this._network.edges.get(edgeID);
		return edge.type == edgeType;
	}
}

Graph.prototype.createDependencyEdge = function(fromRequest, toRequest) {
	this.createEdge(fromRequest, toRequest, Graph.EdgeType.REQUEST);
}

Graph.prototype.createRedirectEdge = function(fromRequest, toRequest) {
	this.createEdge(fromRequest, toRequest, Graph.EdgeType.REDIRECT);
}

Graph.prototype.createEdge = function(fromRequest, toRequest, edgeType) {
	var fromNode = this._graph[fromRequest.getHostname()];
	var toNode = this._graph[toRequest.getHostname()];
	this._network.edges.add({
		id: this._edgesAutoIncrement,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNode.ID,
		to: toNode.ID,
		width: 3,
		dashes: edgeType == Graph.EdgeType.REDIRECT ? true: false,
		type: edgeType,
		links: [{from: fromRequest.url, to: toRequest.url}]
	});
	fromNode.adjacent[toRequest.getHostname()] = {edge: this._network.edges.get(this._edgesAutoIncrement)};
	this._edgesAutoIncrement++;
}

Graph.prototype.addLinkToEdge = function(fromRequest, toRequest) {
	var edge = this._graph[fromRequest.getHostname()].adjacent[toRequest.getHostname()].edge;
	edge.links.push({from: fromRequest.url(), to: toRequest.url});
}

Graph.prototype.addRequestToNode = function(request) {
	var nodeID = this._graph[request.getHostname()].ID;
	this._network.nodes.get(nodeID).requests.push(request);
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
			var selectedNode = this.nodes.get(eventParams.nodes[0]);
			this._selectNodeCallback(selectedNode);
		}
		else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1) {//Edge Selected
			var selectedEdge = this.edges.get(eventParams.edges[0]);
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
	return this._network.nodes.get(ID);
}

Graph.prototype.getEdge = function(ID) {
	return this._network.edges.get(ID);
}
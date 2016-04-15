"use strict";

function Graph(container) {
	this._nodesAutoIncrement = 0;
	this._edgesAutoIncrement = 0;
	this._graph = {};

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

Graph.prototype.existsEdge = function(fromHostname, toHostname, edgeType) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	if(!fromNode.isAdjacentTo(toNode)) return false;
	else {
		var edge = fromNode.getEdgeTo(toNode);
		return edge.type == edgeType;
	}
}

Graph.prototype.existsNode = function(hostname) {
	return hostname in this._graph;
}

Graph.prototype.createNode = function(hostname, requestType) {
	var node = new Node(this._nodesAutoIncrement, requestType, hostname);
	this._addNodeToNetwork(node);
	this._graph[hostname] = node;
	this._nodesAutoIncrement++;
}

Graph.prototype.addRequestToNode = function(request) {
	var node = this._graph[request.getHostname()];
	node.addRequest(request);
}

Graph.prototype.createEdge = function(fromHostname, toHostname, edgeType) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	var edge = new Edge(this._edgesAutoIncrement, edgeType, fromNode, toNode);
	this._addEdgeToNetwork(edge);
	this._edgesAutoIncrement++;

	fromNode.addAdjacentNode(toNode, edge);
}

Graph.prototype.addLinkToEdge = function(fromURL, toURL) {
	var fromNode = this.getNode(Util.getUrlHostname(fromURL));
	var toNode = this.getNode(Util.getUrlHostname(toURL));
	var edge = fromNode.getEdgeTo(toNode);
	edge.addRequest(fromURL, toURL);
}

Graph.prototype.getNode = function(hostname) {
	return this._graph[hostname];
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
			tooltipDelay: 0,
			keyboard: true,
			navigationButtons: true
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
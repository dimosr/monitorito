nodesAutoIncrement = 1;
edgesAutoIncrement = 1;
graph = {};

var EdgeType = {
	REQUEST: "dependency",
	REDIRECT: "redirection",
}

document.addEventListener("DOMContentLoaded", function(event) {
    var container = document.getElementById('graph');

    nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	var data = {
		nodes: nodes,
		edges: edges
	};
	var options = {
		edges: {
			smooth: false
		},
		interaction: {
			tooltipDelay: 0
		},
		physics: {
			"forceAtlas2Based": {
				"gravitationalConstant": -60,
				"centralGravity": 0.005,
				"springLength": 100,
				"springConstant": 0.1,
				"avoidOverlap": 0.5
			},
			"minVelocity": 0.75,
			"solver": "forceAtlas2Based"
		}
	};

	var network = new vis.Network(container, data, options);

	network.on("select", function(eventParams) {
		if(eventParams.nodes.length == 1) {		//only in node selections
			emptyEdgeStatistics();
			showNodeStatistics(eventParams);
		}
		else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1) {	//only in edge selections
			emptyNodeStatistics();
			showEdgeStatistics(eventParams);
		}
	});

	network.on("deselectNode", function(eventParams) {
		var previousSelection = eventParams.previousSelection;
		if(previousSelection.nodes.length == 1) {		//only in node selections
			emptyNodeStatistics();
		}
	});

	network.on("deselectEdge", function(eventParams) {
		var previousSelection = eventParams.previousSelection;
		if(previousSelection.nodes.length == 0 && previousSelection.edges.length == 1) {	//only in edge selections
			emptyEdgeStatistics();
		}
	});

});

function showNodeStatistics(eventParams) {
	nodeId = eventParams.nodes[0];
	node = nodes.get(nodeId);

	document.getElementById('node_domain').innerHTML = node.title;
	$('#node_requests_no').html(node.requests.length);

	var requestsTable = $('#node_requests_dialog tbody');
	for(var i=0; i < node.requests.length; i++) {
		var noColumn = $('<td>').html(i+1);
		var urlColumn = $('<td>').html(node.requests[i]);
		var row = $('<tr>').append(noColumn).append(urlColumn);
		requestsTable.append(row);
	}
	$('#node_requests_opener').show();
}

function showEdgeStatistics(eventParams) {
	edgeId = eventParams.edges[0];
	edge = edges.get(edgeId);

	fromNode = nodes.get(edge.from);
	toNode = nodes.get(edge.to);

	document.getElementById('edge_type').innerHTML = edge.type;
	document.getElementById('edge_from').innerHTML = fromNode.title;
	document.getElementById('edge_to').innerHTML = toNode.title;
	$('#edge_requests_no').html(edge.links.length);

	var requestsTable = $('#edge_requests_dialog tbody');
	for(var i=0; i < edge.links.length; i++) {
		var fromColumn = $('<td>').html(edge.links[i].from);
		var toColumn = $('<td>').html(edge.links[i].to);
		var row = $('<tr>').append(fromColumn).append(toColumn);
		requestsTable.append(row);
	}
	$('#edge_requests_opener').show();
}

function emptyNodeStatistics() {
	document.getElementById('node_domain').innerHTML = "";
	
	$('#node_requests_no').html('');
	$('#node_requests_dialog tbody').html('');
	$('#node_requests_opener').hide();
}

function emptyEdgeStatistics() {
	document.getElementById('edge_type').innerHTML = "";
	document.getElementById('edge_from').innerHTML = "";
	document.getElementById('edge_to').innerHTML = "";

	$('#edge_requests_no').html('');
	$('#edge_requests_dialog tbody').html('');
	$('#edge_requests_opener').hide();
}

function addRequestNode(rootRequest, request) {
	var parsedRootRequestUrl = parseURL(rootRequest);
	var parsedRequestUrl = parseURL(request.url);

	if(!(parsedRequestUrl.hostname in graph)) {
		createGraphNode(parsedRequestUrl, request.type == "main_frame");
	}
	else {
		addRequestToNode(parsedRequestUrl);
	}

	if(!sameDomain(parsedRootRequestUrl, parsedRequestUrl)) {
		if(!existsEdge(parsedRootRequestUrl, parsedRequestUrl, EdgeType.REQUEST)) {
			createDependencyEdge(parsedRootRequestUrl, parsedRequestUrl);
		}
	}

}

function createGraphNode(parsedRequestUrl, isRootRequest) {
	var nodeSize = isRootRequest ? 40 : 20;
	var faviconURL = "http://www.google.com/s2/favicons?domain=" + parsedRequestUrl.host;
	nodes.add({
		id: nodesAutoIncrement, 
		shape: 'circularImage', 
		size: nodeSize, 
		image: faviconURL,
		brokenImage: 'resources/img/default_node_img.jpg', 
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: parsedRequestUrl.hostname,
		requests: [parsedRequestUrl.text]
	});
	graph[parsedRequestUrl.hostname] = {ID: nodesAutoIncrement, adjacent: {}};
	nodesAutoIncrement++;
}

function existsEdge(fromParsedRequestUrl, toParsedRequestUrl, edgeType) {
	var fromNodeAdjVertices = graph[fromParsedRequestUrl.hostname].adjacent;
	if(!(toParsedRequestUrl.hostname in fromNodeAdjVertices)) return false;
	else {
		var edgeID = fromNodeAdjVertices[toParsedRequestUrl.hostname].edge;
		var edge = edges.get(edgeID);
		return edge.type == edgeType;
	}
}

function createDependencyEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, EdgeType.REQUEST);
}

function createRedirectEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, EdgeType.REDIRECT);
}

function createEdge(fromParsedRequestUrl, toParsedRequestUrl, edgeType) {
	var fromNodeId = graph[fromParsedRequestUrl.hostname].ID;
	var toNodeId = graph[toParsedRequestUrl.hostname].ID;
	edges.add({
		id: edgesAutoIncrement,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNodeId,
		to: toNodeId,
		width: 3,
		dashes: edgeType == EdgeType.REDIRECT ? true: false,
		type: edgeType,
		links: [{from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text}]
	})
	graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname] = {edge: edgesAutoIncrement};
	edgesAutoIncrement++;
}

function addLinkToEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	var edgeId = graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname].edge;
	edges.get(edgeId).links.push({from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text});
}

function addRequestToNode(parsedRequestUrl) {
	var nodeID = graph[parsedRequestUrl.hostname].ID;
	nodes.get(nodeID).requests.push(parsedRequestUrl.text);
}

function sameDomain(parsedRootRequestUrl, parsedRequestUrl) {
	return parsedRootRequestUrl.hostname == parsedRequestUrl.hostname;
}
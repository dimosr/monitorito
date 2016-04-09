nodesAutoIncrement = 1;
edgesAutoIncrement = 1;
graph = {};

var EdgeType = {
	REQUEST: "dependency",
	REDIRECT: "redirection",
}

document.addEventListener("DOMContentLoaded", function(event) {
    var container = $('#graph')[0];

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

	$('#node_domain').html(node.title);
	$('#node_requests_no').html(node.requests.length);

	var requestsTable = $('#node_requests_dialog tbody');
	for(var i=0; i < node.requests.length; i++) {
		var noColumn = $('<td>').html(i+1);
		var urlColumn = $('<td>').html(node.requests[i].url.text);
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

	$('#edge_type').html(edge.type);
	$('#edge_from').html(fromNode.title);
	$('#edge_to').html(toNode.title);
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
	$('#node_domain').html('');
	
	$('#node_requests_no').html('');
	$('#node_requests_dialog tbody').html('');
	$('#node_requests_opener').hide();
}

function emptyEdgeStatistics() {
	$('#edge_type').html("");
	$('#edge_from').html("");
	$('#edge_to').html("");

	$('#edge_requests_no').html('');
	$('#edge_requests_dialog tbody').html('');
	$('#edge_requests_opener').hide();
}

function increaseFirstPartySites() {
	var firstPartySites = parseInt($('#first_party').html());
	$('#first_party').html(firstPartySites+1);
}

function increaseThirdPartySites() {
	var thirdPartySites = parseInt($('#third_party').html());
	$('#third_party').html(thirdPartySites+1);
}

function addRequestNode(rootRequest, request) {
	if(!(request.url.hostname in graph)) {
		createGraphNode(request, request.type == "main_frame");
	}
	else {
		addRequestToNode(request);
	}

	if(!sameDomain(rootRequest, request)) {
		if(!existsEdge(rootRequest.url.hostname, request.url.hostname, EdgeType.REQUEST)) {
			createDependencyEdge(rootRequest, request);
		}
	}
}

function createGraphNode(request, isRootRequest) {
	var nodeSize = isRootRequest ? 40 : 20;
	var faviconURL = "http://www.google.com/s2/favicons?domain=" + request.url.host;
	nodes.add({
		id: nodesAutoIncrement, 
		shape: 'circularImage', 
		size: nodeSize, 
		image: faviconURL,
		brokenImage: 'resources/img/default_node_img.jpg', 
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: request.url.hostname,
		requests: [request]
	});
	graph[request.url.hostname] = {ID: nodesAutoIncrement, adjacent: {}};
	nodesAutoIncrement++;
	if(isRootRequest) increaseFirstPartySites();
	else increaseThirdPartySites();
}

function existsEdge(fromHostname, toHostname, edgeType) {
	var fromNodeAdjVertices = graph[fromHostname].adjacent;
	if(!(toHostname in fromNodeAdjVertices)) return false;
	else {
		var edgeID = fromNodeAdjVertices[toHostname].edge;
		var edge = edges.get(edgeID);
		return edge.type == edgeType;
	}
}

function createDependencyEdge(fromRequest, toRequest) {
	createEdge(fromRequest, toRequest, EdgeType.REQUEST);
}

function createRedirectEdge(fromRequest, toRequest) {
	createEdge(fromRequest, toRequest, EdgeType.REDIRECT);
}

function createEdge(fromRequest, toRequest, edgeType) {
	var fromNode = graph[fromRequest.url.hostname];
	var toNode = graph[toRequest.url.hostname];
	edges.add({
		id: edgesAutoIncrement,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNode.ID,
		to: toNode.ID,
		width: 3,
		dashes: edgeType == EdgeType.REDIRECT ? true: false,
		type: edgeType,
		links: [{from: fromRequest.url.text, to: toRequest.url.text}]
	});
	fromNode.adjacent[toRequest.url.hostname] = {edge: edges.get(edgesAutoIncrement)};
	edgesAutoIncrement++;
}

function addLinkToEdge(fromRequest, toRequest) {
	var edge = graph[fromRequest.url.hostname].adjacent[toRequest.url.hostname].edge;
	edge.links.push({from: fromRequest.url.text, to: toRequest.url.text});
}

function addRequestToNode(request) {
	var nodeID = graph[request.url.hostname].ID;
	nodes.get(nodeID).requests.push(request);
}

function sameDomain(request1, request2) {
	return request1.url.hostname == request2.url.hostname;
}
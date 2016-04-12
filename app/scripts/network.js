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
		var methodColumn = $('<td>').html(node.requests[i].method);
		var urlColumn = $('<td>').html(node.requests[i].url.toString());
		var body = $('<ul>');
		if(node.requests[i].method == "POST") {
			var bodyParams = node.requests[i].bodyParams;
			for(var keyIdx = 0; keyIdx < Object.keys(bodyParams).length; keyIdx++) {
				var key = Object.keys(bodyParams)[keyIdx];
				var paramVals = $('<ul>').addClass('param_values').attr('title', 'Values of parameter ' + key);
				for(var j = 0; j < bodyParams[key].length; j++) {
					var paramValue = $('<li>').html(escapeHtml(bodyParams[key][j]));
					paramVals.append(paramValue);
				}
				var paramKey = $('<li>').addClass('param_key').html(key).append(paramVals);
				body.append(paramKey);
			}
		}
		var bodyColumn = $('<td>').html(body);
		var row = $('<tr>').append(methodColumn).append(urlColumn).append(bodyColumn);
		requestsTable.append(row);
	}
	enablePostParamsDialog();
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
	if(!(request.getHostname() in graph)) {
		createGraphNode(request, rootRequest == request);
	}
	else {
		addRequestToNode(request);
	}

	if(!sameDomain(rootRequest, request)) {
		if(!existsEdge(rootRequest.getHostname(), request.getHostname(), EdgeType.REQUEST)) {
			createDependencyEdge(rootRequest, request);
		}
	}
}

function createGraphNode(request, isRootRequest) {
	var nodeSize = isRootRequest ? 40 : 20;
	var faviconURL = "http://www.google.com/s2/favicons?domain=" + request.getHostname();
	nodes.add({
		id: nodesAutoIncrement, 
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
	graph[request.getHostname()] = {ID: nodesAutoIncrement, adjacent: {}};
	nodesAutoIncrement++;
	if(isRootRequest) increaseFirstPartySites();
	else increaseThirdPartySites();
}

function existsEdge(fromhostname, tohostname, edgeType) {
	var fromNodeAdjVertices = graph[fromhostname].adjacent;
	if(!(tohostname in fromNodeAdjVertices)) return false;
	else {
		var edgeID = fromNodeAdjVertices[tohostname].edge;
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
	var fromNode = graph[fromRequest.getHostname()];
	var toNode = graph[toRequest.getHostname()];
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
		links: [{from: fromRequest.url, to: toRequest.url}]
	});
	fromNode.adjacent[toRequest.getHostname()] = {edge: edges.get(edgesAutoIncrement)};
	edgesAutoIncrement++;
}

function addLinkToEdge(fromRequest, toRequest) {
	var edge = graph[fromRequest.getHostname()].adjacent[toRequest.getHostname()].edge;
	edge.links.push({from: fromRequest.url(), to: toRequest.url});
}

function addRequestToNode(request) {
	var nodeID = graph[request.getHostname()].ID;
	nodes.get(nodeID).requests.push(request);
}

function sameDomain(request1, request2) {
	return request1.getHostname() == request2.getHostname();
}
nodesAutoIncrement = 1;
edgesAutoIncrement = 1;
graph = {};

document.addEventListener("DOMContentLoaded", function(event) {
    var container = document.getElementById('graph');

    nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	var data = {
		nodes: nodes,
		edges: edges
	};
	var options = {};

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

	var requestsList = $('#node_requests_dialog ul');
	for(var i=0; i < node.requests.length; i++) {
		var link = createAnchor(node.requests[i], node.requests[i], "_blank", "Request " + (i+1));
		var entry = $('<li>').append(link);
		requestsList.append(entry);
	}
}

function showEdgeStatistics(eventParams) {
	edgeId = eventParams.edges[0];
	edge = edges.get(edgeId);

	fromNode = nodes.get(edge.from);
	toNode = nodes.get(edge.to);

	document.getElementById('edge_type').innerHTML = edge.type;
	document.getElementById('edge_from').innerHTML = fromNode.title;
	document.getElementById('edge_to').innerHTML = toNode.title;

	var requestsList = $('#edge_requests_dialog ul');
	for(var i=0; i < edge.links.length; i++) {
		var span1 = $('<span>').html('Request ' + (i+1) + " : ");
		var link1 = createAnchor(edge.links[i].from, edge.links[i].from, "_blank", "From URL");
		var span2 = $('<span>').html(' --> ');
		var link2 = createAnchor(edge.links[i].to, edge.links[i].to, "_blank", "To URL");
		var entry = $('<li>').append(span1).append(link1).append(span2).append(link2);
		requestsList.append(entry);
	}
}

function emptyNodeStatistics() {
	document.getElementById('node_domain').innerHTML = "";
		
	$('#node_requests_dialog ul').html('');
}

function emptyEdgeStatistics() {
	document.getElementById('edge_type').innerHTML = "";
	document.getElementById('edge_from').innerHTML = "";
	document.getElementById('edge_to').innerHTML = "";

	$('#edge_requests_dialog ul').html('');
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
		if(!existsEdge(parsedRootRequestUrl, parsedRequestUrl)) {
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

function existsEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	fromNodeAdjVertices = graph[fromParsedRequestUrl.hostname].adjacent;
	return toParsedRequestUrl.hostname in fromNodeAdjVertices;
}

function createDependencyEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, "dependency");
}

function createRedirectEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, "redirect");
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
		dashes: edgeType == "redirect" ? true: false,
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
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

	network.on("selectNode", function(eventParams) {
		nodeId = eventParams.nodes[0];
		document.getElementById('node_url').innerHTML = nodes._data[nodeId].title;
	});
	network.on("deselectNode", function(eventParams) {
		document.getElementById('node_url').innerHTML = "";
	});


});



function addRequestNode(rootRequest, request) {
	var parsedRootRequestUrl = parseURL(rootRequest);
	var parsedRequestUrl = parseURL(request.url);

	if(!(parsedRequestUrl.hostname in graph)) {
		createGraphNode(parsedRequestUrl, request.type == "main_frame");
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
		title: parsedRequestUrl.hostname
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
	fromNodeId = graph[fromParsedRequestUrl.hostname].ID;
	toNodeId = graph[toParsedRequestUrl.hostname].ID;
	edges.add({
		id: edgesAutoIncrement,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNodeId,
		to: toNodeId,
		width: 3,
		dashes: edgeType == "redirect" ? true: false,
		links: [{from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text}]
	})
	graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname] = {edge: edgesAutoIncrement};
	edgesAutoIncrement++;
}

function addLinkToEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	edgeId = graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname].edge;
	edges._data[edgeId].links.push({from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text});
}

function sameDomain(parsedRootRequestUrl, parsedRequestUrl) {
	return parsedRootRequestUrl.hostname == parsedRequestUrl.hostname;
}
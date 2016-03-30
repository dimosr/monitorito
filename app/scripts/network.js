nodesAutoIncrement = 1;
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
			createEdgeBetweenNodes(parsedRootRequestUrl, parsedRequestUrl);
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

function createEdgeBetweenNodes(fromParsedRequestUrl, toParsedRequestUrl) {
	fromNodeId = graph[fromParsedRequestUrl.hostname].ID;
	toNodeId = graph[toParsedRequestUrl.hostname].ID;
	edges.add({
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNodeId,
		to: toNodeId,
		width: 3
	})
	graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname] = true;
}

function sameDomain(parsedRootRequestUrl, parsedRequestUrl) {
	return parsedRootRequestUrl.hostname == parsedRequestUrl.hostname;
}
autoIncrement = 1;
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
	var faviconURL = parsedRequestUrl.protocol + "//" + parsedRequestUrl.host + "/favicon.ico";
	nodes.add({
		id: autoIncrement, 
		shape: 'circularImage', 
		size: nodeSize, 
		image: faviconURL,
		brokenImage: 'resources/img/default_node_img.jpg', 
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: parsedRequestUrl.hostname
	});
	graph[parsedRequestUrl.hostname] = {ID: autoIncrement, adjacent: {}};
	autoIncrement++;
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
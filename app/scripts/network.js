autoIncrement = 1;
urlToNodeIdMap = {};

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

function addRequestNode(request) {
	if(request.type == "main_frame" && !urlToNodeIdMap.hasOwnProperty(request.url)) {
		parsedURL = parseURL(request.url)
		faviconURL = parsedURL.protocol + "//" + parsedURL.host + "/favicon.ico"
		nodes.add({
			id: autoIncrement, 
			shape: 'circularImage', 
			size: 25, 
			image: faviconURL,
			brokenImage: 'resources/img/default_node_img.jpg', 
			borderWidth: 5,
			'color.border': '#04000F',
			'color.highlight.border': '#CCC6E2', 
			title: request.url});
		urlToNodeIdMap[request.url] = autoIncrement;
		autoIncrement++;
	}
	else {
		
	}
}
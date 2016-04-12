document.addEventListener("DOMContentLoaded", function(event) {
    var container = $('#graph')[0];

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

	graph = new Graph(container, options);

	graph.onSelectNode(function(selectedNode) {
		emptyEdgeStatistics();
		showNodeStatistics(selectedNode);
	});
	graph.onSelectEdge(function(selectedEdge) {
		emptyNodeStatistics();
		showEdgeStatistics(selectedEdge);
	});
	graph.onDeselectNode(function(deselectedNodes) {
		emptyNodeStatistics();
	});
	graph.onDeselectEdge(function(deselectedEdges) {
		emptyEdgeStatistics();
	});

	var eventSource = new ChromeEventSource();

	var monitoringService = new MonitoringService(eventSource);
	monitoringService.addExcludedUrlPattern("https://www.google.gr/_/chrome/newtab");

	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			var httpRequest = eventSource.buildHttpRequest(details);
			eventSource.notifyForRequest(httpRequest, (details.type == "main_frame"), details.tabId);
		},
		{urls: ["<all_urls>"]},
		['requestBody']
	);

	chrome.webRequest.onBeforeRedirect.addListener(
		function(details) {
			eventSource.notifyForRedirect(details);
		},
		{urls: ["<all_urls>"]}
	);

});

function showNodeStatistics(node) {
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

function showEdgeStatistics(edge) {
	fromNode = graph.getNode(edge.from);
	toNode = graph.getNode(edge.to);

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
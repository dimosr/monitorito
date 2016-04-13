function InterfaceHandler() {}

InterfaceHandler.enableNodeEdgeDialog = function() {
	$( "#node_requests_dialog, #edge_requests_dialog" ).dialog({
		autoOpen: false,
		modal: true,
		width: $(window).width()*0.6,
		height: $(window).height()*0.6
	});
 
	$( "#node_requests_opener" ).click(function() {
		$( "#node_requests_dialog" ).dialog( "open" );
	});
	$( "#edge_requests_opener" ).click(function() {
		$( "#edge_requests_dialog" ).dialog( "open" );
	});
};

InterfaceHandler.enablePostParamsDialog = function() {
	$('.param_key').each(function() {  
		$.data(this, 'dialog', 
			$(this).children('.param_values').dialog({
				autoOpen: false,
				show: {
					effect: "bounce",
					duration: 300
				},
				hide: {
					effect: "scale",
					duration: 300
				},
				modal: true,
				width: $(window).width()*0.3,
				height: $(window).height()*0.3,
				stack: true
			})
		);  
	}).click(function() {
		$.data(this, 'dialog').dialog('open');
		return false;  
	});  
}


InterfaceHandler.increaseFirstPartySites = function() {
	var firstPartySites = parseInt($('#first_party').html());
	$('#first_party').html(firstPartySites+1);
}

InterfaceHandler.increaseThirdPartySites = function() {
	var thirdPartySites = parseInt($('#third_party').html());
	$('#third_party').html(thirdPartySites+1);
}


InterfaceHandler.showNodeStatistics = function(node) {
	$('#node_domain').html(node.getDomain());
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
	InterfaceHandler.enablePostParamsDialog();
	$('#node_requests_opener').show();
}

InterfaceHandler.showEdgeStatistics = function(edge) {
	fromNode = edge.from;
	toNode = edge.to;

	$('#edge_type').html(edge.type.name);
	$('#edge_from').html(fromNode.getDomain());
	$('#edge_to').html(toNode.getDomain());
	$('#edge_requests_no').html(edge.links.length);

	var requestsTable = $('#edge_requests_dialog tbody');
	for(var i=0; i < edge.links.length; i++) {
		var fromColumn = $('<td>').html(edge.links[i].from.url);
		var toColumn = $('<td>').html(edge.links[i].to.url);
		var row = $('<tr>').append(fromColumn).append(toColumn);
		requestsTable.append(row);
	}
	$('#edge_requests_opener').show();
}

InterfaceHandler.emptyNodeStatistics = function() {
	$('#node_domain').html('');
	
	$('#node_requests_no').html('');
	$('#node_requests_dialog tbody').html('');
	$('#node_requests_opener').hide();
}

InterfaceHandler.emptyEdgeStatistics = function() {
	$('#edge_type').html("");
	$('#edge_from').html("");
	$('#edge_to').html("");

	$('#edge_requests_no').html('');
	$('#edge_requests_dialog tbody').html('');
	$('#edge_requests_opener').hide();
}

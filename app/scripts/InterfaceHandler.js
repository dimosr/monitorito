function InterfaceHandler() {
	this.nodeWidget = {
		$opener: $("#node_requests_opener"),
		$dialogContent: $("#node_requests_dialog"),
		$dialogTableBody: $("#node_requests_dialog tbody"),
		$domainField: $("#node_domain"),
		$requestsNumberField: $("#node_requests_no")
	};
	this.edgeWidget = {
		$opener: $("#edge_requests_opener"),
		$dialogContent: $("#edge_requests_dialog"),
		$dialogTableBody: $("#edge_requests_dialog tbody"),
		$typeField: $("#edge_type"),
		$from: $("#edge_from"),
		$to: $("#edge_to"),
		$requestsNumberField: $("#edge_requests_no")
	}

	this.firstPartyContainer = $("#first_party");
	this.thirdPartyContainer = $("#third_party");
}

InterfaceHandler.prototype.enableWidgetDialogs = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: $(window).width()*0.6,
		height: $(window).height()*0.6
	};
	this.nodeWidget.$dialogContent.dialog(dialogOptions);
	this.edgeWidget.$dialogContent.dialog(dialogOptions);
 
	this.nodeWidget.$opener.click({content: this.nodeWidget.$dialogContent}, function(event) {
		event.data.content.dialog( "open" );
	});
	this.edgeWidget.$opener.click({content: this.edgeWidget.$dialogContent}, function(event) {
		event.data.content.dialog( "open" );
	});
};

InterfaceHandler.prototype.enablePostParamsDialog = function() {
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

InterfaceHandler.prototype.setFirstPartySites = function(sitesNumber) {
	this.firstPartyContainer.html(sitesNumber);
}

InterfaceHandler.prototype.setThirdPartySites = function(sitesNumber) {
	this.thirdPartyContainer.html(sitesNumber);
}

InterfaceHandler.prototype.showNodeStatistics = function(node) {
	var widget = this.nodeWidget;
	var requests = node.requests;
	widget.$domainField.html(node.getDomain());
	widget.$requestsNumberField.html(requests.length);

	var requestsRows = "";
	for(var i=0; i < requests.length; i++) {
		var request = requests[i];
		var methodColumn = "<td>" + request.method + "</td>";
		var urlColumn = "<td>" + request.url + "</td>";
		var parametersContent = "";
		if(request.method == "POST") {
			var bodyParams = request.bodyParams;
			var paramKeys = Object.keys(bodyParams);
			for(var keyIdx = 0; keyIdx < paramKeys.length; keyIdx++) {
				var key = paramKeys[keyIdx];
				var paramValues = "";
				for(var j = 0; j < bodyParams[key].length; j++) {
					var paramValue = "<li>" + Util.escapeHtml(bodyParams[key][j]) + "</li>";
					paramValues += paramValue;
				}
				paramValues = "<ul title='Values of parameter " + key + "' class='param_values'>" + paramValues + "</ul>";
				parametersContent += "<li class='param_key'>" + key + paramValues + "</li>";
			}
		}
		var bodyColumn = "<td><ul>" + parametersContent + "</ul></td>";
		requestsRows += "<tr>" + methodColumn + urlColumn + bodyColumn + "</tr>";
	}
	widget.$dialogTableBody.append(requestsRows);

	this.enablePostParamsDialog();
	widget.$opener.show();
}

InterfaceHandler.prototype.showEdgeStatistics = function(edge) {
	var widget = this.edgeWidget;
	var fromNode = edge.from;
	var toNode = edge.to;
	var links = edge.links;

	widget.$typeField.html(edge.type.name);
	widget.$from.html(fromNode.getDomain());
	widget.$to.html(toNode.getDomain());
	widget.$requestsNumberField.html(links.length);

	var contentToAdd = '';
	for(var i=0; i < links.length; i++) {
		var fromCol = "<td>" + links[i].from.url + "</td>";
		var toCol = "<td>" + links[i].to.url + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	widget.$dialogTableBody.append(contentToAdd);
	widget.$opener.show();
}

InterfaceHandler.prototype.emptyNodeStatistics = function() {
	var widget = this.nodeWidget;
	widget.$domainField.html('');
	widget.$requestsNumberField.html('');
	widget.$dialogTableBody.html('');
	widget.$opener.hide();
}

InterfaceHandler.prototype.emptyEdgeStatistics = function() {
	var widget = this.edgeWidget;
	widget.$typeField.html("");
	widget.$from.html("");
	widget.$to.html("");
	widget.$requestsNumberField.html("");
	widget.$dialogTableBody.html('');
	widget.$opener.hide();
}

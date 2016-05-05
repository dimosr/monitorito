"use strict";

function InterfaceHandler() {
	this.nodeWidget = {
		$container: $("#node_widget"),
		$opener: $("#node_requests_opener"),
		$dialogContent: $("#node_requests_dialog"),
		$dialogTableBody: $("#node_requests_dialog tbody"),
		$domainField: $("#node_domain"),
		$requestsNumberField: $("#node_requests_no")
	};
	this.edgeWidget = {
		$container: $("#edge_widget"),
		$opener: $("#edge_requests_opener"),
		$dialogContent: $("#edge_requests_dialog"),
		$dialogTableBody: $("#edge_requests_dialog tbody"),
		$typeField: $("#edge_type"),
		$from: $("#edge_from"),
		$to: $("#edge_to"),
		$requestsNumberField: $("#edge_requests_no")
	}

	this.init();
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.configureControlPanel();

	this.sideWidgetHandler = new SideWidgetHandler(this.controller);
}

InterfaceHandler.prototype.configureControlPanel = function() {
	$("#monitoring-switch").off("click");
	$("#monitoring-switch").on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableMonitoring();
		else controller.disableMonitoring();
	});
}

InterfaceHandler.prototype.init = function() {
	this.enableWidgetDialogs();
}

InterfaceHandler.prototype.enableWidgetDialogs = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: $(window).width()*0.7,
		height: $(window).height()*0.7
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

InterfaceHandler.prototype.showNodeStatistics = function(node) {
	var widget = this.nodeWidget;
	var requests = node.getRequests();
	widget.$domainField.html(node.getDomain());
	widget.$requestsNumberField.html(requests.length);

	var requestsRows = "";
	for(var i=0; i < requests.length; i++) {
		var request = requests[i];
		var typeColumn = "<td>" + request.type + "</td>";
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
		requestsRows += "<tr>" + typeColumn + methodColumn + urlColumn + bodyColumn + "</tr>";
	}
	widget.$dialogTableBody.append(requestsRows);

	this.enablePostParamsDialog();
	widget.$container.show();
}

InterfaceHandler.prototype.showEdgeStatistics = function(edge) {
	var widget = this.edgeWidget;
	var fromNode = edge.getSourceNode();
	var toNode = edge.getDestinationNode();
	var requests = edge.getRequests();

	widget.$typeField.html(edge.getType().name);
	widget.$from.html(fromNode.getDomain());
	widget.$to.html(toNode.getDomain());
	widget.$requestsNumberField.html(requests.length);

	var contentToAdd = '';
	for(var i=0; i < requests.length; i++) {
		var fromCol = "<td>" + requests[i].from + "</td>";
		var toCol = "<td>" + requests[i].to + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	widget.$dialogTableBody.append(contentToAdd);
	widget.$container.show();
}

InterfaceHandler.prototype.emptyNodeStatistics = function() {
	this.nodeWidget.$container.hide();
}

InterfaceHandler.prototype.emptyEdgeStatistics = function() {
	var widget = this.edgeWidget.$container.hide();
}
"use strict";

function InterfaceHandler() {
	this.nodeWidget = {
		$container: $("#node_widget"),
		$opener: $("#node_requests_opener"),
		$dialogContent: $("#node_requests_dialog"),
		$dialogTableBody: $("#node_requests_dialog tbody"),
		$domainField: $("#node_domain"),
		$requestsNumberField: $("#node_requests_no"),
		selectedNode: null,
		requestsLoaded: false

	};
	this.edgeWidget = {
		$container: $("#edge_widget"),
		$opener: $("#edge_requests_opener"),
		$dialogContent: $("#edge_requests_dialog"),
		$dialogTableBody: $("#edge_requests_dialog tbody"),
		$typeField: $("#edge_type"),
		$from: $("#edge_from"),
		$to: $("#edge_to"),
		$requestsNumberField: $("#edge_requests_no"),
		selectedEdge: null,
		requestsLoaded: false
	}

	this.init();
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.configureControlPanel();

	this.sideWidgetHandler = new SideWidgetHandler(this.controller);
}

InterfaceHandler.prototype.configureControlPanel = function() {
	$("#monitoring-switch").on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableMonitoring();
		else controller.disableMonitoring();
	});

	$("#physics-switch").on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableGraphPhysics();
		else controller.disableGraphPhysics();
	});

	$("#export-button").on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		console.log(controller.getMonitoredData());
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
 
	this.nodeWidget.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.nodeWidget;
		if(!widget.requestsLoaded) {
			handler.loadNodeRequests(widget.selectedNode);
			widget.requestsLoaded = true;
		}
		widget.$dialogContent.dialog( "open" );
	});

	this.edgeWidget.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.edgeWidget;
		if(!widget.requestsLoaded) {
			handler.loadEdgeRequests(widget.selectedEdge);
			widget.requestsLoaded = false;
		}
		widget.$dialogContent.dialog( "open" );
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
	
	widget.selectedNode = node;

	widget.$container.show();
	this.sideWidgetHandler.updateSelectedNodeStats(node);
}

InterfaceHandler.prototype.loadNodeRequests = function(node) {
	var widget = this.nodeWidget;
	var requests = node.getRequests();

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
	widget.selectedEdge = edge;

	widget.$container.show();
}

InterfaceHandler.prototype.loadEdgeRequests = function(edge) {
	var widget = this.edgeWidget;
	var requests = edge.getRequests();

	var contentToAdd = '';
	for(var i=0; i < requests.length; i++) {
		var fromCol = "<td>" + requests[i].from + "</td>";
		var toCol = "<td>" + requests[i].to + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	widget.$dialogTableBody.append(contentToAdd);
}

InterfaceHandler.prototype.emptyNodeStatistics = function() {
	this.nodeWidget.$container.hide();
	this.nodeWidget.selectedNode = null;
	this.nodeWidget.requestsLoaded = false;
	this.nodeWidget.$dialogTableBody.empty();
	this.sideWidgetHandler.updateSelectedNodeStats(null);
}

InterfaceHandler.prototype.emptyEdgeStatistics = function() {
	this.edgeWidget.$container.hide();
	this.edgeWidget.selectedEdge = null;
	this.edgeWidget.requestsLoaded = false;
	this.edgeWidget.$dialogTableBody.empty();
}
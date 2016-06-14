"use strict";

function InterfaceHandler() {
	this.screenDimensions = {
		width: $(window).width(),
		height: $(window).height()
	};
	this.edgeWidget = {
		$container: $("#edge_widget"),
		requests : {
			$numberField: $("#edge_requests_no"),
			$opener: $("#edge_requests_opener"),
			$dialogContent: $("#edge_requests_dialog"),
			$dialogTableBody: $("#edge_requests_dialog tbody"),
			loaded: false
		},
		redirects: {
			$numberField: $("#edge_redirects_no"),
			$opener: $("#edge_redirects_opener"),
			$dialogContent: $("#edge_redirects_dialog"),
			$dialogTableBody: $("#edge_redirects_dialog tbody"),
			loaded: false
		},
		referrals: {
			$numberField: $("#edge_referrals_no"),
			$opener: $("#edge_referrals_opener"),
			$dialogContent: $("#edge_referrals_dialog"),
			$dialogTableBody: $("#edge_referrals_dialog tbody"),
			loaded: false
		},
		$typeField: $("#edge_type"),
		$from: $("#edge_from"),
		$to: $("#edge_to"),
		selectedEdge: null
	};
	this.modeMenu = $("#mode-dialog");
	this.graphContainer = $("#graph");
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.initNodeWidget();
	this.initEdgeWidget();
	this.initControlWidgetHandler();
	this.initSideWidgetHandler();

	this.showModeMenu();
}

InterfaceHandler.prototype.initControlWidgetHandler = function() {
	var controlWidget = {
		physics: {
			$container: $("#physics-switch-container"),
			$button: $("#physics-switch"),
		},
		monitoring: {$button: $("#monitoring-switch")},
		export: {$button: $("#export-button")}
	};
	this.controlWidgetHandler = new ControlWidgetHandler(this.controller, controlWidget);
}

InterfaceHandler.prototype.initSideWidgetHandler = function() {
	var statisticsWidget = {
		$container: $("#side-widget"),
		$trigger: $("#side-widget-trigger"),
		$nodeTypesPlotContainer: $("#node-types"),
		$inEdgesPlotContainer: $("#in-edges"),
		$outEdgesPlotContainer: $("#out-edges"),
		$nodeMetricsPlotContainer: $("#node-metrics")
	};
	this.sideWidgetHandler = new SideWidgetHandler(this.controller, statisticsWidget);
}

InterfaceHandler.prototype.initNodeWidget = function() {
	var nodeWidget = {
		$container: $("#node_widget"),
		$opener: $("#node_requests_opener"),
		$dialogContent: $("#node_requests_dialog"),
		$dialogTableBody: $("#node_requests_dialog tbody"),
		$domainField: $("#node_domain"),
		$requestsNumberField: $("#node_requests_no")
	};
	this.nodeWidgetHandler = new NodeWidgetHandler(this.controller, nodeWidget, this.screenDimensions);
}

InterfaceHandler.prototype.initEdgeWidget = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: $(window).width()*0.6,
		height: $(window).height()*0.6
	};
	this.edgeWidget.requests.$dialogContent.dialog(dialogOptions);
	this.edgeWidget.redirects.$dialogContent.dialog(dialogOptions);
	this.edgeWidget.referrals.$dialogContent.dialog(dialogOptions);
	this.edgeWidget.requests.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.edgeWidget;
		if(!widget.requests.loaded) {
			handler.loadEdgeRequests(widget.selectedEdge);
			widget.requests.loaded = false;
		}
		widget.requests.$dialogContent.dialog( "open" );
	});
	this.edgeWidget.redirects.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.edgeWidget;
		if(!widget.redirects.loaded) {
			handler.loadEdgeRedirects(widget.selectedEdge);
			widget.redirects.loaded = false;
		}
		widget.redirects.$dialogContent.dialog( "open" );
	});

	this.edgeWidget.referrals.$opener.click({handler: this}, function(event) {
		var handler = event.data.handler;
		var widget = handler.edgeWidget;
		if(!widget.referrals.loaded) {
			handler.loadEdgeReferrals(widget.selectedEdge);
			widget.referrals.loaded = false;
		}
		widget.referrals.$dialogContent.dialog( "open" );
	});
}

InterfaceHandler.prototype.showModeMenu = function() {
	$("#online-mode").click({interfaceHandler: this}, function(event){
		var interfaceHandler = event.data.interfaceHandler;
		interfaceHandler.controller.setGraphMode(Graph.Mode.ONLINE);
		interfaceHandler.modeMenu.dialog("close");
	});
	$("#offline-mode").click({interfaceHandler: this}, function(event){
		var interfaceHandler = event.data.interfaceHandler;
		interfaceHandler.controller.setGraphMode(Graph.Mode.OFFLINE);
		interfaceHandler.modeMenu.dialog("close");
	});

	this.modeMenu.dialog({
		autoOpen: true,
		draggable: false,
		modal: true,
		title: "Select Mode",
		width: $(window).width()*0.7,
		closeOnEscape: false,
    	dialogClass: "noclose"
	});
}

InterfaceHandler.prototype.disableVisualisation = function() {
	this.graphContainer.addClass("disabled");
	this.controlWidgetHandler.hidePhysicsOption();
}

InterfaceHandler.prototype.showNodeInfo = function(node) {
	this.nodeWidgetHandler.showInfo(node);
	this.sideWidgetHandler.updateSelectedNodeStats(node);
}

InterfaceHandler.prototype.emptyNodeStatistics = function() {
	this.nodeWidgetHandler.emptyInfo();
	this.sideWidgetHandler.resetSelectedNodeStats();
}

InterfaceHandler.prototype.showEdgeStatistics = function(edge) {
	var widget = this.edgeWidget;
	var fromNode = edge.getSourceNode();
	var toNode = edge.getDestinationNode();

	widget.$typeField.html(edge.getType().name);
	widget.$from.html(fromNode.getDomain());
	widget.$to.html(toNode.getDomain());
	widget.requests.$numberField.html(edge.getRequests().length);
	widget.redirects.$numberField.html(edge.getRedirects().length);
	widget.referrals.$numberField.html(edge.getReferrals().length);
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
	widget.requests.$dialogTableBody.append(contentToAdd);
}

InterfaceHandler.prototype.loadEdgeRedirects = function(edge) {
	var widget = this.edgeWidget;
	var redirects = edge.getRedirects();

	var contentToAdd = '';
	for(var i=0; i < redirects.length; i++) {
		var fromCol = "<td>" + redirects[i].from + "</td>";
		var toCol = "<td>" + redirects[i].to + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	widget.redirects.$dialogTableBody.append(contentToAdd);
}

InterfaceHandler.prototype.loadEdgeReferrals = function(edge) {
	var widget = this.edgeWidget;
	var referrals = edge.getReferrals();

	var contentToAdd = '';
	for(var i=0; i < referrals.length; i++) {
		var fromCol = "<td>" + referrals[i].from + "</td>";
		var toCol = "<td>" + referrals[i].to + "</td>";
		contentToAdd += "<tr>" + fromCol + toCol + "</tr>";
	}
	widget.referrals.$dialogTableBody.append(contentToAdd);
}

InterfaceHandler.prototype.emptyEdgeStatistics = function() {
	this.edgeWidget.$container.hide();
	this.edgeWidget.selectedEdge = null;
	this.edgeWidget.requests.loaded = false;
	this.edgeWidget.redirects.loaded = false;
	this.edgeWidget.referrals.loaded = false;
	this.edgeWidget.requests.$dialogTableBody.empty();
	this.edgeWidget.redirects.$dialogTableBody.empty();
	this.edgeWidget.referrals.$dialogTableBody.empty();
}

InterfaceHandler.prototype.getGraphDomElement = function() {
	return this.graphContainer[0];
}
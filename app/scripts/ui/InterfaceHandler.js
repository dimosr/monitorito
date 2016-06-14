"use strict";

function InterfaceHandler() {
	this.screenDimensions = {
		width: $(window).width(),
		height: $(window).height()
	};
	this.graphContainer = $("#graph");
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.initNodeWidgetHandler();
	this.initEdgeWidgetHandler();
	this.initControlWidgetHandler();
	this.initSideWidgetHandler();
	this.initModeWidgetHandler();
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

InterfaceHandler.prototype.initNodeWidgetHandler = function() {
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

InterfaceHandler.prototype.initEdgeWidgetHandler = function() {
	var edgeWidget = {
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
	this.edgeWidgetHandler = new EdgeWidgetHandler(this.controller, edgeWidget, this.screenDimensions);
}

InterfaceHandler.prototype.initModeWidgetHandler = function() {
	var modeWidget = {
		$container: $("#mode-dialog"),
		$onlineModeButton: $("#online-mode"),
		$offlineModeButton: $("#offline-mode")
	}
	this.modeWidgetHandler = new ModeWidgetHandler(this.controller, modeWidget, this.screenDimensions);
}

InterfaceHandler.prototype.disableVisualisation = function() {
	this.graphContainer.addClass("disabled");
	this.controlWidgetHandler.hidePhysicsOption();
}

InterfaceHandler.prototype.showNodeInfo = function(node) {
	this.nodeWidgetHandler.showInfo(node);
	this.sideWidgetHandler.updateSelectedNodeStats(node);
}

InterfaceHandler.prototype.emptyNodeInfo = function() {
	this.nodeWidgetHandler.emptyInfo();
	this.sideWidgetHandler.resetSelectedNodeStats();
}

InterfaceHandler.prototype.showEdgeInfo = function(edge) {
	this.edgeWidgetHandler.showInfo(edge);
}

InterfaceHandler.prototype.emptyEdgeInfo = function() {
	this.edgeWidgetHandler.emptyInfo();
}

InterfaceHandler.prototype.getGraphDomElement = function() {
	return this.graphContainer[0];
}
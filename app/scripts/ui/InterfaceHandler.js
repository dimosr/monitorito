"use strict";

function InterfaceHandler() {
	this.screenDimensions = {
		width: $(window).width(),
		height: $(window).height()
	};
	this.graphContainer = $("#graph");
	this.loader = $("#loader");
	this.loadExtensions();
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.initManipulationWidgetHandler();
	this.initClusterWidgetHandler();
	this.initNodeWidgetHandler();
	this.initEdgeWidgetHandler();
	this.initControlWidgetHandler();
	this.initSideWidgetHandler();
	this.initModeWidgetHandler();
}

InterfaceHandler.prototype.initManipulationWidgetHandler = function() {
	var manipulationWidget = {
		clustering: {
			$clusterID: $("#cluster_id"),
			$clusterButton: $("#cluster-button"),
			$clusterOptions: $("#cluster-options"),
			$clusterForm: $("#cluster-options form"),
			$addRowButton: $("#cluster-options .add-row-button"),
			$submitButton: $("#cluster-options .submit-button"),
			$cancelButton: $("#cluster-options .cancel-button"),
			$declusterButton: $("#decluster_button")
		}
	}
	this.manipulationWidgetHandler = new ManipulationWidgetHandler(this.controller, manipulationWidget, this.screenDimensions);
}

InterfaceHandler.prototype.initClusterWidgetHandler = function() {
	var clusterWidget = {
		$container: $("#cluster_widget"),
		$clusterID: $("#cluster_id"),
		nodes: {
			$numberField: $("#cluster_nodes_num"),
			$opener: $("#cluster_nodes_opener"),
			$dialogContent: $("#cluster_nodes_dialog"),
			$dialogTableBody: $("#cluster_nodes_dialog tbody")
		}
	};
	this.clusterWidgetHandler = new ClusterWidgetHandler(this.controller, clusterWidget, this.screenDimensions);
}

InterfaceHandler.prototype.initControlWidgetHandler = function() {
	var controlWidget = {
		physics: {
			$container: $("#physics-switch-container"),
			$button: $("#physics-switch"),
		},
		monitoring: {$button: $("#monitoring-switch")},
		export: {
			data: {$button: $("#export-data-button")},
			graph: {$button: $("#export-graph-button")}
		}
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
		requests: {
			$numberField: $("#node_requests_no"),
			$opener: $("#node_requests_opener"),
			$dialogContent: $("#node_requests_dialog"),
			$dialogTableBody: $("#node_requests_dialog tbody"),
			loaded: false
		},
		firstPartyCookies: {
			$numberField: $("#node_cookies_1st_no"),
			$opener: $("#node_cookies_1st_opener"),
			$dialogContent: $("#node_cookies_1st_dialog"),
			$dialogTableBody: $("#node_cookies_1st_dialog tbody"),
			loaded: false
		},
		thirdPartyCookies: {
			$numberField: $("#node_cookies_3rd_no"),
			$opener: $("#node_cookies_3rd_opener"),
			$dialogContent: $("#node_cookies_3rd_dialog"),
			$dialogTableBody: $("#node_cookies_3rd_dialog tbody"),
			loaded: false
		},
		$domainField: $("#node_domain")
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

InterfaceHandler.prototype.showClusterInfo = function(cluster) {
	this.clusterWidgetHandler.showInfo(cluster);
	this.sideWidgetHandler.updateSelectedNodeStats(cluster);
}

InterfaceHandler.prototype.emptyClusterInfo = function() {
	this.clusterWidgetHandler.emptyInfo();
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

InterfaceHandler.prototype.showLoader = function() {
	this.loader.show();
}

InterfaceHandler.prototype.hideLoader = function() {
	this.loader.hide();
}

InterfaceHandler.prototype.loadExtensions = function() {
	$.extend({ alert: function (message, title) {
		$("<div></div>").dialog( {
			buttons: { "Ok": function () { $(this).dialog("close"); } },
			close: function (event, ui) { $(this).remove(); },
			resizable: false,
			draggable: false,
			title: title,
			modal: true
		}).text(message);
	}});
}
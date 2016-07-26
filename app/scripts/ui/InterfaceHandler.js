"use strict";

function InterfaceHandler() {
	this.screenDimensions = {
		width: $(window).width(),
		height: $(window).height()
	};
	this.graphContainer = $("#graph");
	this.loader = $("#loader");
	this.filterRibbon = $("#ribbon");
	this.tabs = $("#tabs-container");
	this.batchImport = $("#batch-import");

	this.initialiseTabs();
	this.loadExtensions();
}

InterfaceHandler.prototype.setController = function(controller) {
	this.controller = controller;
	this.initBatchImportWidgetHandler();
	this.initManipulationWidgetHandler();
	this.initClusterWidgetHandler();
	this.initNodeWidgetHandler();
	this.initEdgeWidgetHandler();
	this.initControlWidgetHandler();
	this.initSideWidgetHandler();
	this.initModeWidgetHandler();
}

InterfaceHandler.prototype.initBatchImportWidgetHandler = function() {
	var batchImportWidget = {
		$batchImport: $("#batch-import"),
		$submit: $("#batch-import .submit-button"),
		$cancel: $("#batch-import .cancel-button")
	};
	this.batchImportWidgetHandler = new BatchImportWidgetHandler(this.controller, batchImportWidget, this.screenDimensions);
}

InterfaceHandler.prototype.initManipulationWidgetHandler = function() {
	var manipulationWidget = {
		$container: $("#manipulation_widget"),
		clustering: {
			$clusterButton: $("#cluster-button"),
			$clusterOptions: $("#create-cluster-options"),
			$clusterForm: $("#create-cluster-options form"),
			$tabs: this.tabs,
			$addRowButton: $("#create-cluster-options .add-row-button"),
			$batchImportButton: $("#create-cluster-options .batch-import-button"),
			$submitButton: $("#create-cluster-options .submit-button"),
			$cancelButton: $("#create-cluster-options .cancel-button"),
			$declusterAllButton: $("#decluster_all_button")
		},
		filtering: {
			$filterButton: $("#filter-button"),
			$filterOptions: $("#filter-options"),
			$filterForm: $("#filter-options form"),
			$submitButton: $("#filter-options .submit-button"),
			$cancelButton: $("#filter-options .cancel-button"),
			$resetFilter: $("#reset-filter-button"),
			$filteringRules: $("#filtering-rules")
		},
		$collapseAllButton: $("#colapse_all_button"),
		$expandAllButton: $("#expand_all_button")
	};
	this.manipulationWidgetHandler = new ManipulationWidgetHandler(this.controller, manipulationWidget, this.screenDimensions, this.batchImportWidgetHandler);
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
		},
		clustering: {
			$editClusterButton: $("#edit_cluster_button"),
			$clusterOptions: $("#edit-cluster-options"),
			$clusterForm: $("#edit-cluster-options form"),
			$addRowButton: $("#edit-cluster-options .add-row-button"),
			$batchImportButton: $("#edit-cluster-options .batch-import-button"),
			$submitButton: $("#edit-cluster-options .submit-button"),
			$cancelButton: $("#edit-cluster-options .cancel-button")
		},
		$declusterButton: $("#decluster_button")
	};
	this.clusterWidgetHandler = new ClusterWidgetHandler(this.controller, clusterWidget, this.screenDimensions, this.batchImportWidgetHandler);
}

InterfaceHandler.prototype.initControlWidgetHandler = function() {
	var controlWidget = {
		physics: {
			$container: $("#physics-switch-container"),
			$button: $("#physics-switch"),
		},
		monitoring: {$button: $("#monitoring-switch")},
		straightEdges: {$button: $("#edges-switch")},
		export: {
			data: {$button: $("#export-data-button")},
			graph: {$button: $("#export-graph-button")}
		},
		reset: {$button: $("#reset-data-button")}
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
		$expandButton: $("#expand_button"),
		$collapseButton: $("#collapse_button"),
		$explorerPanel: $("#explorer_panel"),
		$nodeID: $("#node_id")
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
	this.graphContainer.addClass("disabled-panel");
	this.controlWidgetHandler.hidePhysicsOption();
	this.manipulationWidgetHandler.hide();
}

InterfaceHandler.prototype.showNodeInfo = function(node) {
	this.nodeWidgetHandler.showInfo(node);
	if(node instanceof DomainNode) this.sideWidgetHandler.updateSelectedNodeStats(node);
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

InterfaceHandler.prototype.executeWithLoader = function(callback) {
	this.showLoader();
	setTimeout(function(interfaceHandler) {
		try {
			callback();
		}
		catch(err) {
			$.alert(err.message, "Error");
		}
		finally {
			interfaceHandler.hideLoader();
		}
	}, 50, this);
}

InterfaceHandler.prototype.showFilterRibbon = function() {
	this.filterRibbon.show();
}

InterfaceHandler.prototype.hideFilterRibbon = function() {
	this.filterRibbon.hide();
}

InterfaceHandler.prototype.initialiseTabs = function() {
	this.tabs.tabs();
}

InterfaceHandler.prototype.loadExtensions = function() {
	$.extend({
		alert: function (message, title) {
			$("<div></div>").dialog( {
				buttons: { "Ok": function () { $(this).dialog("close"); } },
				close: function (event, ui) { $(this).remove(); },
				resizable: false,
				draggable: false,
				title: title,
				modal: true
			}).text(message);
		},
		confirm: function(message, title, callback) {
			$("<div></div>").dialog( {
				buttons: {
					"Ok": function () { $(this).dialog("close");callback(); },
					"Cancel": function() { $(this).dialog("close");}
				},
				close: function (event, ui) { $(this).remove(); },
				resizable: false,
				draggable: false,
				title: title,
				modal: true
			}).text(message);
		}
	});
}
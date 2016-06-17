"use strict";

/* For reference of the widget structure, check InterfaceHandler.initClusterWidgetHandler */
function ClusterWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.controller = controller;

	this.screenDimensions = screenDimensions;
	this.init();
}

ClusterWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.6,
		height: this.screenDimensions.height*0.6
	};
	this.widget.nodes.$dialogContent.dialog(dialogOptions);

	this.widget.nodes.$opener.click({handler: this}, function(event) {
		event.data.handler.widget.$dialogContent.dialog("open");
	});
}

ClusterWidgetHandler.prototype.showInfo = function(cluster) {
	var clusterNodes = cluster.getNodes()
	this.widget.$clusterID.html(cluster.id);
	this.widget.nodes.$numberField.html(clusterNodes.length);
	this.loadClusteredNodes(nodes);
	this.widget.$container.show();
}

ClusterWidgetHandler.prototype.loadClusteredNodes = function(nodes) {
	var contentToAdd = '';
	for(var i = 0; i < nodes.length; i++) {
		var nodeDomain = "<td>" + node.getDomain() + "</td>";
		contentToAdd += "<tr>" + nodeDomain + "</tr>";
	}
	this.widget.nodes.$dialogTableBody.append(contentToAdd);
}

ClusterWidgetHandler.prototype.emptyInfo = function() {
	this.widget.$container.hide();
	this.widget.$clusterID.empty();
	this.widget.nodes.$numberField.empty();
	this.widget.nodes.$dialogTableBody.empty();
}
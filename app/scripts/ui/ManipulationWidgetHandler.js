"use strict";

/* For reference of the widget structure, check InterfaceHandler.initManipulationWidgetHandler */
function ManipulationWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.controller = controller;

	this.screenDimensions = screenDimensions;
	this.init();
}

ManipulationWidgetHandler.prototype.init = function() {
	var dialogOptions = {
		autoOpen: false,
		modal: true,
		width: this.screenDimensions.width*0.6,
		height: this.screenDimensions.height*0.6
	};
	this.widget.clustering.$clusterOptions.dialog(dialogOptions);

	this.widget.clustering.$clusterButton.click({handler: this}, function(event) {
		event.data.handler.widget.clustering.$clusterOptions.dialog("open");
	});
	this.widget.clustering.$addRowButton.click({handler: this}, function(event) {
		event.data.handler.widget.clustering.$clusterForm.find("fieldset:nth-child(2)").append("<input class='domain' type='text'>");
	});
	this.widget.clustering.$submitButton.click({handler: this}, function(event) {
		event.data.handler.executeClustering();
	});
	this.widget.clustering.$cancelButton.click({handler: this}, function(event) {
		event.data.handler.resetForm();
		event.data.handler.widget.clustering.$clusterOptions.dialog("close");
	});
}

ManipulationWidgetHandler.prototype.executeClustering = function() {
	var clusterID = this.widget.clustering.$clusterForm.find("input.cluster-id").val();
	if(clusterID.trim() != "") {
		var domains = [];
		this.widget.clustering.$clusterForm.find("input.domain").each(
			function(idx, elem) {
				if(elem.value.trim() != "") domains.push(elem.value);
			}
		);
		this.controller.clusterByDomain(domains, clusterID);
		this.widget.clustering.$clusterOptions.dialog("close");
		this.resetForm();
	}
	else $.alert("Cluster ID field is empty! You have to provide a value.", "Required Field");
	
}

ManipulationWidgetHandler.prototype.resetForm = function() {
	this.widget.clustering.$clusterForm.find("input.cluster-id").val("");
	this.widget.clustering.$clusterForm.find("input.domain:eq(0)").val("");
	this.widget.clustering.$clusterForm.find("input.domain").not(":first").remove();
}
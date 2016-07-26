"use strict";

/* For reference of the widget structure, check InterfaceHandler.initControlWidgetHandler */
function ControlWidgetHandler(controller, widget) {
	this.widget = widget;
	this.controller = controller;
	this.init();
}

ControlWidgetHandler.prototype.init = function() {
	this.widget.monitoring.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableMonitoring();
		else controller.disableMonitoring();
	});

	this.widget.physics.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableGraphPhysics();
		else controller.disableGraphPhysics();
	});

	this.widget.straightEdges.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableStraightEdges();
		else controller.disableStraightEdges();
	});

	this.widget.export.data.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		controller.extractMonitoredData();
	});

	this.widget.export.graph.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		controller.extractGraphData();
	});

	this.widget.reset.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		controller.resetData();
	});
}

ControlWidgetHandler.prototype.hidePhysicsOption = function() {
	this.widget.physics.$container.hide();
}
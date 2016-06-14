"use strict";

function ModeWidgetHandler(controller, widget, screenDimensions) {
	this.widget = widget;
	this.controller = controller;
	this.screenDimensions = screenDimensions;

	this.init();
}

ModeWidgetHandler.prototype.init = function() {
	this.widget.$onlineModeButton.click({handler: this}, function(event){
		var handler = event.data.handler;
		handler.controller.setGraphMode(Graph.Mode.ONLINE);
		handler.widget.$container.dialog("close");
	});
	this.widget.$offlineModeButton.click({handler: this}, function(event){
		var handler = event.data.handler;
		handler.controller.setGraphMode(Graph.Mode.OFFLINE);
		handler.widget.$container.dialog("close");
	});

	this.widget.$container.dialog({
		autoOpen: true,
		draggable: false,
		modal: true,
		title: "Select Mode",
		width: this.screenDimensions.width*0.7,
		closeOnEscape: false,
    	dialogClass: "noclose"
	});
}
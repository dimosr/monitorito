"use strict";

function BatchImportWidgetHandler(controller, widget, screenDimensions) {
    this.widget = widget;
    this.controller = controller;

    this.screenDimensions = screenDimensions;
    this.init();

    this.submitCallback = null;
}

BatchImportWidgetHandler.prototype.init = function() {
    this.widget.$batchImport.dialog({
        width: this.screenDimensions.width*0.6,
        height: this.screenDimensions.height*0.85,
        autoOpen: false,
        dialogClass: "no-close",
        resizable: false,
        draggable: false,
        title: "Batch Import",
        modal: true
    });

    this.widget.$submit.click({handler: this}, function(event) {
        var domains = event.data.handler.parseDomains();
        event.data.handler.submitCallback(domains);
        event.data.handler.widget.$batchImport.dialog("close");
        event.data.handler.resetForm();
    });
    this.widget.$cancel.click({handler: this}, function(event) {
        event.data.handler.resetForm();
        event.data.handler.widget.$batchImport.dialog("close");
    });
}

BatchImportWidgetHandler.prototype.openBatchImport = function(submitCallback, domains) {
    if(domains !== undefined) this.setDomains(domains);
    this.submitCallback = submitCallback;
    this.widget.$batchImport.dialog("open");
}

BatchImportWidgetHandler.prototype.parseDomains = function() {
    return this.widget.$batchImport.find("textarea").val().split("\n");
}

BatchImportWidgetHandler.prototype.setDomains = function(domains) {
    this.widget.$batchImport.find("textarea").val(domains.join("\n"));
}

BatchImportWidgetHandler.prototype.resetForm = function() {
    this.widget.$batchImport.find("form")[0].reset();
}
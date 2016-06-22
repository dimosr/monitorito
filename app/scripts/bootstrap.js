"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
	var bootstrapper = new Bootstrapper();
});

function Bootstrapper() {
	var interfaceHandler = new InterfaceHandler();
    var graphHandler = new GraphHandler(new GraphStatsCalculator());

	var eventSource = new ChromeEventSource(chrome);
	eventSource.collectRequests();
	eventSource.collectHeaders();
	eventSource.collectRedirects();
	eventSource.collectRequestCompletions();
	eventSource.collectRequestErrors();

	var monitoringService = new MonitoringService(eventSource);
	monitoringService.addExcludedUrlPattern(new RegExp("google\.(.+)/_/chrome/newtab", "i"));

	var storageService = new ChromeStorageService(chrome.storage.local, new Downloader());

	var controller = new CentralController(interfaceHandler, monitoringService, graphHandler, storageService);
	monitoringService.setController(controller);
	graphHandler.setController(controller);
	interfaceHandler.setController(controller);
	storageService.setController(controller);

	this.interfaceHandler = interfaceHandler;
	this.graphHandler = graphHandler;
	this.storageService = storageService;
	this.monitoringService = monitoringService;
	this.controller = controller;
}
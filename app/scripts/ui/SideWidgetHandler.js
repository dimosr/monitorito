"use strict";

function SideWidgetHandler(controller) {
	this.controller = controller;

	this.enableSideWidget();
	this.initialiseStatisticsGraphs();
}

SideWidgetHandler.prototype.enableSideWidget = function() {
	var handler = this;
	$('#side-widget').slideReveal({
  		trigger: $("#side-widget-trigger"),
  		push: false,
  		position: "right",
  		width: "25%",
  		show: function(slider, trigger){
  			handler.showGraphStatistics();
  		}
	});
}

SideWidgetHandler.prototype.initialiseStatisticsGraphs = function() {
	var data = {
		labels: ["Max.", "Min."],
		datasets: [
			{
				label: "Incoming Edges",
				backgroundColor: "rgba(255,99,132,0.2)",
				borderColor: "rgba(255,99,132,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(255,99,132,0.4)",
				hoverBorderColor: "rgba(255,99,132,1)",
				data: [0, 0],
			}
		]
	};

	var inEdgesCtx = $("#in-edges");
	this.incomingEdgesGraph = new Chart(inEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});

	var data = {
		labels: ["Max.", "Min."],
		datasets: [
			{
				label: "Outgoing Edges",
				backgroundColor: "rgba(230,230,0,0.2)",
				borderColor: "rgba(230,230,0,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(230,230,0,0.4)",
				hoverBorderColor: "rgba(230,230,0,1)",
				data: [0, 0],
			}
		]
	};

	var outEdgesCtx = $("#out-edges");
	this.outgoingEdgesGraph = new Chart(outEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});
}

SideWidgetHandler.prototype.showGraphStatistics = function() {
	var graphStatistics = this.controller.getGraphStatistics();
	this.showIncomingEdgesStatistics(graphStatistics);
	this.showOutgoingEdgesStatistics(graphStatistics);
}

SideWidgetHandler.prototype.showIncomingEdgesStatistics = function(graphStatistics) {
	var data = [graphStatistics.inEdges.max, graphStatistics.inEdges.min];
	this.incomingEdgesGraph.data.datasets[0].data = data;
	this.incomingEdgesGraph.update();
}

SideWidgetHandler.prototype.showOutgoingEdgesStatistics = function(graphStatistics) {
	var data = [graphStatistics.outEdges.max, graphStatistics.outEdges.min];
	this.outgoingEdgesGraph.data.datasets[0].data = data;
	this.outgoingEdgesGraph.update();
}

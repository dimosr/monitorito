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
  		width: "30%",
  		show: function(slider, trigger){
  			handler.showGraphStatistics();
  		}
	});
}

SideWidgetHandler.prototype.initialiseStatisticsGraphs = function() {
	var data = {
		labels: ["1st party", "3rd party"],
		datasets: [
			{
				label: "Node Types",
				backgroundColor: ["rgba(0,153,51,0.2)", "rgba(204,0,0,0.2)"],
				borderColor: ["rgba(0,153,51,1)", "rgba(204,0,0,1)"],
				borderWidth: 1,
				hoverBackgroundColor: ["rgba(0,153,51,0.4)", "rgba(204,0,0,0.4)"],
				hoverBorderColor: ["rgba(0,153,51,1)", "rgba(204,0,0,1)"],
				data: [0, 0],
			}
		]
	};

	var nodeTypesCtx = $("#node-types");
	this.nodeTypesPlot = new Chart(nodeTypesCtx, {
	    type: 'doughnut',
		data: data,
		options: {}
	});

	var data = {
		labels: ["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"],
		datasets: [
			{
				label: "Incoming Edges",
				backgroundColor: "rgba(255,117,26,0.2)",
				borderColor: "rgba(255,117,26,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(255,117,26,0.4)",
				hoverBorderColor: "rgba(255,117,26,1)",
				data: [0, 0, 0, 0, 0, 0],
			}
		]
	};

	var inEdgesCtx = $("#in-edges");
	this.incomingEdgesPlot = new Chart(inEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});

	var data = {
		labels: ["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"],
		datasets: [
			{
				label: "Outgoing Edges",
				backgroundColor: "rgba(230,230,0,0.2)",
				borderColor: "rgba(230,230,0,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(230,230,0,0.4)",
				hoverBorderColor: "rgba(230,230,0,1)",
				data: [0, 0, 0, 0, 0, 0],
			}
		]
	};

	var outEdgesCtx = $("#out-edges");
	this.outgoingEdgesPlot = new Chart(outEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});

	var data = {
		labels: ["Phishing.", "Tracking", "Leaking"],
		datasets: [
			{
				label: "Node Metrics",
				backgroundColor: "rgba(153,0,153,0.2)",
				borderColor: "rgba(153,0,153,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(153,0,153,0.4)",
				hoverBorderColor: "rgba(153,0,153,1)",
				data: [0, 0, 0],
			}
		]
	};

	var nodeMetricsCtx = $("#node-metrics");
	this.nodeMetricsPlot = new Chart(nodeMetricsCtx, {
	    type: 'radar',
		data: data,
		options: {
			scale: {
                ticks: {
                    display: false,
                    min: 0,
                    max: 100
                }
            }
		}
	});
}

SideWidgetHandler.prototype.showGraphStatistics = function() {
	var graphStatistics = this.controller.getGraphStatistics();
	this.showNodeTypesStatistics(graphStatistics);
	this.showIncomingEdgesStatistics(graphStatistics);
	this.showOutgoingEdgesStatistics(graphStatistics);
}

SideWidgetHandler.prototype.showNodeTypesStatistics = function(graphStatistics) {
	var data = [graphStatistics.nodeTypes.root, graphStatistics.nodeTypes.embedded];
	this.nodeTypesPlot.data.datasets[0].data = data;
	this.nodeTypesPlot.update();
}

SideWidgetHandler.prototype.showIncomingEdgesStatistics = function(graphStatistics) {
	var stats = graphStatistics.inEdges;
	var selectedNodeInEdges = this.incomingEdgesPlot.data.datasets[0].data[5];
	var data = [stats.max, stats.avg+stats.stdDev, stats.avg, stats.avg-stats.stdDev, stats.min, selectedNodeInEdges];
	this.incomingEdgesPlot.data.datasets[0].data = data;
	this.incomingEdgesPlot.update();
}

SideWidgetHandler.prototype.showOutgoingEdgesStatistics = function(graphStatistics) {
	var stats = graphStatistics.outEdges;
	var selectedNodeOutEdges = this.outgoingEdgesPlot.data.datasets[0].data[5];
	var data = [stats.max, stats.avg+stats.stdDev, stats.avg, stats.avg-stats.stdDev, stats.min, selectedNodeOutEdges];
	this.outgoingEdgesPlot.data.datasets[0].data = data;
	this.outgoingEdgesPlot.update();
}

SideWidgetHandler.prototype.updateSelectedNodeStats = function(node) {
	var outgoingEdges = (node != null) ? node.getOutgoingEdges().length : 0;
	var incomingEdges = (node != null) ? node.getIncomingEdges().length : 0;

	this.outgoingEdgesPlot.data.datasets[0].data[5] = outgoingEdges;
	this.incomingEdgesPlot.data.datasets[0].data[5] = incomingEdges;
	this.outgoingEdgesPlot.update();
	this.incomingEdgesPlot.update();

	if(node == null) {
		this.nodeMetricsPlot.data.datasets[0].data = [0, 0, 0];
	}
	else {
		var metrics = this.controller.getGraphNodeMetrics(node);
		this.nodeMetricsPlot.data.datasets[0].data[0] = metrics.phishing;
		this.nodeMetricsPlot.data.datasets[0].data[1] = metrics.tracking;
		this.nodeMetricsPlot.data.datasets[0].data[2] = metrics.leaking;
	}
	this.nodeMetricsPlot.update();
}


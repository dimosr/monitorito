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
	/* Apply rounding to tooltips */
	Chart.defaults.global.tooltips.callbacks.label = function(tooltipItem, data) {
		var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
		var label = data.datasets[tooltipItem.datasetIndex].label;
		var percentage = SideWidgetHandler.round(value);
		return label + ': ' + percentage;
	};

	var data = {
		labels: ["1st party domains", "3rd party domains"],
		datasets: [
			{
				label: "Node Types",
				backgroundColor: ["rgba(173,173,133,0.2)", "rgba(153,38,0,0.2)"],
				borderColor: ["rgba(173,173,133,1)", "rgba(153,38,0,1)"],
				borderWidth: 1,
				hoverBackgroundColor: ["rgba(173,173,133,0.4)", "rgba(153,38,0,0.4)"],
				hoverBorderColor: ["rgba(173,173,133,1)", "rgba(153,38,0,1)"],
				data: [0, 0]
			}
		]
	};

	var nodeTypesCtx = $("#node-types");
	this.nodeTypesPlot = new Chart(nodeTypesCtx, {
	    type: 'doughnut',
		data: data,
		options: {tooltipTemplate: "<%= value + ' %' %>"}
	});

	data = {
		labels: ["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"],
		datasets: [
			{
				label: "Incoming Referral Edges",
				backgroundColor: "rgba(179,0,0,0.2)",
				borderColor: "rgba(179,0,0,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(179,0,0,0.4)",
				hoverBorderColor: "rgba(179,0,0,1)",
				data: [0, 0, 0, 0, 0, 0]
			},
			{
				label: "Incoming Non-Referral Edges",
				backgroundColor: "rgba(51,153,51,0.2)",
				borderColor: "rgba(51,153,51,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(51,153,51,0.4)",
				hoverBorderColor: "rgba(51,153,51,1)",
				data: [0, 0, 0, 0, 0, 0]
			}
		]
	};

	var inEdgesCtx = $("#in-edges");
	this.incomingEdgesPlot = new Chart(inEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});

	data = {
		labels: ["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"],
		datasets: [
			{
				label: "Outgoing Referral Edges",
				backgroundColor: "rgba(230,184,0,0.2)",
				borderColor: "rgba(230,184,0,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(230,184,0,0.4)",
				hoverBorderColor: "rgba(230,184,0,1)",
				data: [0, 0, 0, 0, 0, 0]
			},
			{
				label: "Outgoing Non-Referral Edges",
				backgroundColor: "rgba(46,92,184,0.2)",
				borderColor: "rgba(46,92,184,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(46,92,184,0.4)",
				hoverBorderColor: "rgba(46,92,184,1)",
				data: [0, 0, 0, 0, 0, 0]
			}
		]
	};

	var outEdgesCtx = $("#out-edges");
	this.outgoingEdgesPlot = new Chart(outEdgesCtx, {
	    type: 'bar',
		data: data,
		options: {}
	});

	data = {
		labels: ["Phishing.", "Tracking", "Leaking"],
		datasets: [
			{
				label: "Node Metrics",
				backgroundColor: "rgba(153,0,153,0.2)",
				borderColor: "rgba(153,0,153,1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(153,0,153,0.4)",
				hoverBorderColor: "rgba(153,0,153,1)",
				data: [0, 0, 0]
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
	var data = [graphStatistics.nodeTypes.firstParty, graphStatistics.nodeTypes.thirdParty];
	this.nodeTypesPlot.data.datasets[0].data = data;
	this.nodeTypesPlot.update();
}

SideWidgetHandler.prototype.showIncomingEdgesStatistics = function(graphStatistics) {
	var referralStats = graphStatistics.inEdges.referral;
	var nonReferralStats = graphStatistics.inEdges.nonReferral;
	var selectedNodeInReferralEdges = this.incomingEdgesPlot.data.datasets[0].data[5];
	var selectedNodeInNonReferralEdges = this.incomingEdgesPlot.data.datasets[1].data[5];
	var referralEdgesdata = [referralStats.max, referralStats.avg+referralStats.stdDev, referralStats.avg, referralStats.avg-referralStats.stdDev, referralStats.min, selectedNodeInReferralEdges];
	var nonReferralEdgesdata = [nonReferralStats.max, nonReferralStats.avg+nonReferralStats.stdDev, nonReferralStats.avg, nonReferralStats.avg-nonReferralStats.stdDev, nonReferralStats.min, selectedNodeInNonReferralEdges];
	this.incomingEdgesPlot.data.datasets[0].data = referralEdgesdata;
	this.incomingEdgesPlot.data.datasets[1].data = nonReferralEdgesdata;
	this.incomingEdgesPlot.update();
}

SideWidgetHandler.prototype.showOutgoingEdgesStatistics = function(graphStatistics) {
	var referralStats = graphStatistics.outEdges.referral;
	var nonReferralStats = graphStatistics.outEdges.nonReferral;
	var selectedNodeOutReferralEdges = this.outgoingEdgesPlot.data.datasets[0].data[5];
	var selectedNodeOutNonReferralEdges = this.outgoingEdgesPlot.data.datasets[1].data[5];
	var referralEdgesData = [referralStats.max, referralStats.avg+referralStats.stdDev, referralStats.avg, referralStats.avg-referralStats.stdDev, referralStats.min, selectedNodeOutReferralEdges];
	var nonReferralEdgesData = [nonReferralStats.max, nonReferralStats.avg+nonReferralStats.stdDev, nonReferralStats.avg, nonReferralStats.avg-nonReferralStats.stdDev, nonReferralStats.min, selectedNodeOutNonReferralEdges];
	this.outgoingEdgesPlot.data.datasets[0].data = referralEdgesData;
	this.outgoingEdgesPlot.data.datasets[1].data = nonReferralEdgesData;
	this.outgoingEdgesPlot.update();
}

SideWidgetHandler.prototype.updateSelectedNodeStats = function(node) {
	if(node == null) {
		this.outgoingEdgesPlot.data.datasets[0].data[5] = 0;
		this.outgoingEdgesPlot.data.datasets[1].data[5] = 0;
		this.incomingEdgesPlot.data.datasets[0].data[5] = 0;
		this.incomingEdgesPlot.data.datasets[1].data[5] = 0;
	}
	else {
		var outEdges = node.getOutgoingEdgesByType();
		var inEdges = node.getIncomingEdgesByType();
		this.outgoingEdgesPlot.data.datasets[0].data[5] = outEdges[Edge.Type.REFERRAL.name].length;
		this.outgoingEdgesPlot.data.datasets[1].data[5] = outEdges[Edge.Type.DEFAULT.name].length + outEdges[Edge.Type.REDIRECT.name].length + outEdges[Edge.Type.REQUEST.name].length;
		this.incomingEdgesPlot.data.datasets[0].data[5] = inEdges[Edge.Type.REFERRAL.name].length;
		this.incomingEdgesPlot.data.datasets[1].data[5] = inEdges[Edge.Type.DEFAULT.name].length + inEdges[Edge.Type.REDIRECT.name].length + inEdges[Edge.Type.REQUEST.name].length;
	}
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

SideWidgetHandler.round = function(number) {
	return Math.round(number * 1000) / 1000;
}
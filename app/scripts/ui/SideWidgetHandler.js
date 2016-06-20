"use strict";

/* For reference of the widget structure, check InterfaceHandler.initSideWidgetHandler */
function SideWidgetHandler(controller, widget) {
	this.widget = widget;

	this.controller = controller;

	this.enableSideWidget();
	this.initialiseStatisticsGraphs();
}

/* @Docs
Initialises the slider for the side widget
Uses slideReveal.js library
*/
SideWidgetHandler.prototype.enableSideWidget = function() {
	var handler = this;
	this.widget.$container.slideReveal({
  		trigger: handler.widget.$trigger,
  		push: false,
  		position: "right",
  		width: "30%",
  		show: function(slider, trigger){
  			handler.showGraphStatistics();
  		}
	});
}

/* @Docs
Initialises all the plots
Uses Chart.js library
*/
SideWidgetHandler.prototype.initialiseStatisticsGraphs = function() {
	this.addTooltipRounding();

	this.nodeTypesPlot = new Chart(this.widget.$nodeTypesPlotContainer, {
	    type: 'doughnut',
	    options: {},
		data: this.generatePlotData(["1st party domains", "3rd party domains"], [null], [[{r:173,g:173,b:133},{r:153,g:38,b:0}]])
	});
	this.incomingEdgesPlot = new Chart(this.widget.$inEdgesPlotContainer, {
	    type: 'bar',
	    options: {},
		data: this.generatePlotData(["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"], ["Incoming Referral Edges", "Incoming Non-Referral Edges"], [{r:179,g:0,b:0}, {r:51,g:153,b:51}])
	});
	this.outgoingEdgesPlot = new Chart(this.widget.$outEdgesPlotContainer, {
	    type: 'bar',
	    options: {},
		data: this.generatePlotData(["Max.", "Avg.+S.D.", "Avg.", "Avg.-S.D.", "Min.", "Selected"], ["Outgoing Referral Edges", "Outgoing Non-Referral Edges"], [{r:230,g:184,b:0}, {r:46,g:92,b:184}])
	});
	this.nodeMetricsPlot = new Chart(this.widget.$nodeMetricsPlotContainer, {
	    type: 'radar',
	    options: {
			scale: {
				ticks: {display: false, min: 0, max: 100}
			}
		},
		data: this.generatePlotData(["Phishing.", "Tracking", "Tracking Cookies", "Leaking"], ["Node Metrics"], [{r:153,g:0,b:153}])
	});
}

SideWidgetHandler.prototype.addTooltipRounding = function() {
	Chart.defaults.global.tooltips.callbacks.label = function(tooltipItem, data) {
		var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
		var label = data.datasets[tooltipItem.datasetIndex].label;
		var percentage = SideWidgetHandler.round(value);
		return label + ': ' + percentage;
	};
}

SideWidgetHandler.prototype.generatePlotData = function(plotLabels, datasetLabels, datasetColor) {
	var data = {
		labels: plotLabels,
		datasets: new Array(datasetLabels.length)
	};
	for(var i = 0; i < datasetLabels.length; i++) {
		var dataset = {
			label: datasetLabels[i],
			backgroundColor: (datasetColor[i] instanceof Array) ? [] : "",
			borderColor: (datasetColor[i] instanceof Array) ? [] : "",
			hoverBackgroundColor: (datasetColor[i] instanceof Array) ? [] : "",
			hoverBorderColor: (datasetColor[i] instanceof Array) ? [] : "",
		};
		if(datasetColor[i] instanceof Array) {
			for(var j = 0; j < datasetColor[i].length; j++) {
				var color = "rgba(" + datasetColor[i][j].r + "," + datasetColor[i][j].g + "," + datasetColor[i][j].b + "," + "[opacity]" + ")";
				dataset.backgroundColor[j] = color.replace("[opacity]", "0.2");
				dataset.borderColor[j] = color.replace("[opacity]", "1");
				dataset.hoverBackgroundColor[j] = color.replace("[opacity]", "0.4");
				dataset.hoverBorderColor[j] = color.replace("[opacity]", "1");
			}
		}
		else {
			var color = "rgba(" + datasetColor[i].r + "," + datasetColor[i].g + "," + datasetColor[i].b + "," + "[opacity]" + ")";
			dataset.backgroundColor = color.replace("[opacity]", "0.2");
			dataset.borderColor = color.replace("[opacity]", "1");
			dataset.hoverBackgroundColor = color.replace("[opacity]", "0.4");
			dataset.hoverBorderColor = color.replace("[opacity]", "1");
		}
		dataset.borderWidth = 1;
		dataset.data = new Array(plotLabels.length);
		data.datasets[i] = dataset;
	}
	return data;
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
	var referralEdgesdata = [referralStats.max, referralStats.avg+referralStats.stdDev, referralStats.avg, referralStats.avg-referralStats.stdDev, referralStats.min, this.incomingEdgesPlot.data.datasets[0].data[5]];
	var nonReferralEdgesdata = [nonReferralStats.max, nonReferralStats.avg+nonReferralStats.stdDev, nonReferralStats.avg, nonReferralStats.avg-nonReferralStats.stdDev, nonReferralStats.min, this.incomingEdgesPlot.data.datasets[1].data[5]];
	this.incomingEdgesPlot.data.datasets[0].data = referralEdgesdata;
	this.incomingEdgesPlot.data.datasets[1].data = nonReferralEdgesdata;
	this.incomingEdgesPlot.update();
}

SideWidgetHandler.prototype.showOutgoingEdgesStatistics = function(graphStatistics) {
	var referralStats = graphStatistics.outEdges.referral;
	var nonReferralStats = graphStatistics.outEdges.nonReferral;
	var referralEdgesData = [referralStats.max, referralStats.avg+referralStats.stdDev, referralStats.avg, referralStats.avg-referralStats.stdDev, referralStats.min, this.outgoingEdgesPlot.data.datasets[0].data[5]];
	var nonReferralEdgesData = [nonReferralStats.max, nonReferralStats.avg+nonReferralStats.stdDev, nonReferralStats.avg, nonReferralStats.avg-nonReferralStats.stdDev, nonReferralStats.min, this.outgoingEdgesPlot.data.datasets[1].data[5]];
	this.outgoingEdgesPlot.data.datasets[0].data = referralEdgesData;
	this.outgoingEdgesPlot.data.datasets[1].data = nonReferralEdgesData;
	this.outgoingEdgesPlot.update();
}

SideWidgetHandler.prototype.updateSelectedNodeStats = function(node) {
	var outEdges = Edge.groupEdgesByType(node.getOutgoingEdges());
	var inEdges = Edge.groupEdgesByType(node.getIncomingEdges());
	this.outgoingEdgesPlot.data.datasets[0].data[5] = outEdges[Edge.Type.REFERRAL.name].length;
	this.outgoingEdgesPlot.data.datasets[1].data[5] = outEdges[Edge.Type.DEFAULT.name].length + outEdges[Edge.Type.REDIRECT.name].length + outEdges[Edge.Type.REQUEST.name].length;
	this.incomingEdgesPlot.data.datasets[0].data[5] = inEdges[Edge.Type.REFERRAL.name].length;
	this.incomingEdgesPlot.data.datasets[1].data[5] = inEdges[Edge.Type.DEFAULT.name].length + inEdges[Edge.Type.REDIRECT.name].length + inEdges[Edge.Type.REQUEST.name].length;
	this.outgoingEdgesPlot.update();
	this.incomingEdgesPlot.update();

	var metrics = this.controller.getGraphNodeMetrics(node);
	this.nodeMetricsPlot.data.datasets[0].data = [metrics.phishing, metrics.tracking, metrics.trackingCookies, metrics.leaking];
	this.nodeMetricsPlot.update();
}

SideWidgetHandler.prototype.resetSelectedNodeStats = function() {
	this.outgoingEdgesPlot.data.datasets[0].data[5] = 0;
	this.outgoingEdgesPlot.data.datasets[1].data[5] = 0;
	this.incomingEdgesPlot.data.datasets[0].data[5] = 0;
	this.incomingEdgesPlot.data.datasets[1].data[5] = 0;
	this.outgoingEdgesPlot.update();
	this.incomingEdgesPlot.update();

	this.nodeMetricsPlot.data.datasets[0].data = [0, 0, 0];
	this.nodeMetricsPlot.update();
}

SideWidgetHandler.round = function(number) {
	return Math.round(number * 1000) / 1000;
}
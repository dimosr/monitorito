"use strict";

function NodeMetricsCalculator() {}

/*  @Docs
	Returns node metrics of the given node/cluster
	Math.min is only used for clusters, that can 
	present values greater than 100 due to aggregation
	of multiple nodes
*/
NodeMetricsCalculator.prototype.getNodeMetrics = function(node, graphStatistics) {
	var metricsValues = {};
	NodeMetricsFactory.getInstance().getMetrics().map(function(metric) {
		metricsValues[metric.getCodeName()] = Math.min(metric.calculate(node, graphStatistics), 100);
	});
	return metricsValues;
}
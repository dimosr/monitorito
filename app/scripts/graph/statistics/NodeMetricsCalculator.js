"use strict";

function NodeMetricsCalculator() {

}

NodeMetricsCalculator.prototype.getNodeMetrics = function(node, graphStatistics) {
	return {
		phishing: this.getPhishingMetric(node, graphStatistics),
		tracking: this.getTrackingMetric(node, graphStatistics),
		leaking: this.getLeakingMetric(node, graphStatistics)
	};
}

NodeMetricsCalculator.prototype.getPhishingMetric = function(node, graphStatistics) {
	var outEdges = node.getOutgoingEdges().length; 
	var inEdges = node.getIncomingEdges().length;
	return (1/(1+inEdges+outEdges))*100;
}

NodeMetricsCalculator.prototype.getTrackingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.max;
	var inEdges = node.getIncomingEdges().length;
	return (inEdges/maxIncomingEdges)*100;
}

NodeMetricsCalculator.prototype.getLeakingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.max;
	var outEdges = node.getOutgoingEdges();
	var sum = 0;
	for(var i = 0; i < outEdges.length; i++) {
		var neighbourIncomingEdges = outEdges[i].getDestinationNode().getIncomingEdges().length;
		sum += Math.pow(neighbourIncomingEdges / maxIncomingEdges,2)
	}
	sum = (sum/outEdges.length)*100;
	return sum;
}
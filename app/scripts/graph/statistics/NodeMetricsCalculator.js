"use strict";

function NodeMetricsCalculator() {

}

NodeMetricsCalculator.prototype.getNodeMetrics = function(node, graphStatistics) {
	return {
		phishing: this.getPhishingMetric(node, graphStatistics),
		tracking: this.getTrackingMetric(node, graphStatistics),
		leaking: this.getLeakingMetric(node, graphStatistics),
		trackingCookies: this.getTrackingCookiesMetric(node)
	};
}

NodeMetricsCalculator.prototype.getPhishingMetric = function(node, graphStatistics) {
	var outEdges = node.getOutgoingEdges().length; 
	var inEdges = node.getIncomingEdges().length;
	return (1/(1+inEdges+outEdges))*100;
}

NodeMetricsCalculator.prototype.getTrackingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var inEdges = node.getIncomingEdgesByType()[Edge.Type.REFERRAL.name].length;
	return (inEdges/maxIncomingEdges)*100;
}

NodeMetricsCalculator.prototype.getTrackingCookiesMetric = function(node) {
	var firstPartyCookiesNum = Object.keys(node.getFirstPartyCookies()).length;
	var thirdPartyCookiesNum = Object.keys(node.getThirdPartyCookies()).length;
	return thirdPartyCookiesNum / (thirdPartyCookiesNum + firstPartyCookiesNum) * 100;
}

NodeMetricsCalculator.prototype.getLeakingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var outEdges = node.getOutgoingEdgesByType()[Edge.Type.REFERRAL.name];
	var sum = 0;
	for(var i = 0; i < outEdges.length; i++) {
		var neighbourNode = outEdges[i].getDestinationNode();
		var neighbourIncomingEdges = neighbourNode.getIncomingEdgesByType()[Edge.Type.REFERRAL.name].length;
		sum += Math.pow(neighbourIncomingEdges / maxIncomingEdges,2)
	}
	sum = (sum/outEdges.length)*100;
	return sum;
}
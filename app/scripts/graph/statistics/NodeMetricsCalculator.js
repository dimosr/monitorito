"use strict";

function NodeMetricsCalculator() {

}

/*  @Docs
	Returns node metrics of the given node/cluster
	Math.min is only used for clusters, that can 
	present values greater than 100 due to aggregation
	of multiple nodes
*/
NodeMetricsCalculator.prototype.getNodeMetrics = function(node, graphStatistics) {
	return {
		phishing: Math.min(this.getPhishingMetric(node, graphStatistics), 100),
		tracking: Math.min(this.getTrackingMetric(node, graphStatistics), 100),
		leaking: Math.min(this.getLeakingMetric(node, graphStatistics), 100),
		trackingCookies: Math.min(this.getTrackingCookiesMetric(node),100)
	};
}

NodeMetricsCalculator.prototype.getPhishingMetric = function(node, graphStatistics) {
	var outEdges = node.getOutgoingEdges().length; 
	var inEdges = node.getIncomingEdges().length;
	return (1/(1+inEdges+outEdges))*100;
}

NodeMetricsCalculator.prototype.getTrackingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var inEdges = Edge.groupEdgesByType(node.getIncomingEdges())[Edge.Type.REFERRAL.name].length;
	return (inEdges/maxIncomingEdges)*100;
}

NodeMetricsCalculator.prototype.getTrackingCookiesMetric = function(node) {
	var firstPartyCookiesNum = Object.keys(node.getFirstPartyCookies()).length;
	var thirdPartyCookiesNum = Object.keys(node.getThirdPartyCookies()).length;
	return thirdPartyCookiesNum / (thirdPartyCookiesNum + firstPartyCookiesNum) * 100;
}

NodeMetricsCalculator.prototype.getLeakingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var outEdges = Edge.groupEdgesByType(node.getOutgoingEdges())[Edge.Type.REFERRAL.name];
	var sum = 0;
	for(var i = 0; i < outEdges.length; i++) {
		var neighbourNode = outEdges[i].getDestinationNode();
		var neighbourIncomingEdges = Edge.groupEdgesByType(neighbourNode.getIncomingEdges())[Edge.Type.REFERRAL.name].length;
		sum += Math.pow(neighbourIncomingEdges / maxIncomingEdges,2)
	}
	sum = (sum/outEdges.length)*100;
	return sum;
}
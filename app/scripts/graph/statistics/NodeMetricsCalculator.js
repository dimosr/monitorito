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
	var outEdges = node.getOutgoingDomainEdges(true).length;
	var inEdges = node.getIncomingDomainEdges(true).length;
	return (1/(1+inEdges+outEdges))*100;
}

NodeMetricsCalculator.prototype.getTrackingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var inEdges = DomainEdge.groupEdgesByType(node.getIncomingDomainEdges(true))[DomainEdge.Type.REFERRAL.name].length;
	return (maxIncomingEdges > 0) ? (inEdges/maxIncomingEdges)*100 : 0;
}

NodeMetricsCalculator.prototype.getTrackingCookiesMetric = function(node) {
	var firstPartyCookiesNum = Object.keys(node.getFirstPartyCookies()).length;
	var thirdPartyCookiesNum = Object.keys(node.getThirdPartyCookies()).length;
	var totalCookiesNum = firstPartyCookiesNum + thirdPartyCookiesNum;
	return (totalCookiesNum > 0) ? thirdPartyCookiesNum/totalCookiesNum*100 : 0;
}

NodeMetricsCalculator.prototype.getLeakingMetric = function(node, graphStatistics) {
	var maxIncomingEdges = graphStatistics.inEdges.referral.max;
	var outEdges = DomainEdge.groupEdgesByType(node.getOutgoingDomainEdges(true))[DomainEdge.Type.REFERRAL.name];
	var sum = 0;
	for(var i = 0; i < outEdges.length; i++) {
		var neighbourNode = outEdges[i].getDestinationNode();
		var neighbourIncomingEdges = DomainEdge.groupEdgesByType(neighbourNode.getIncomingDomainEdges(true))[DomainEdge.Type.REFERRAL.name].length;
		var neighbourWeight = (maxIncomingEdges > 0) ? Math.pow(neighbourIncomingEdges / maxIncomingEdges,2) : 0;
		sum += neighbourWeight;
	}
	return (outEdges.length > 0) ? (sum/outEdges.length)*100 : 0;
}
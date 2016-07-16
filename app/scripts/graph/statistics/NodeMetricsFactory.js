"use strict";

/*  @Docs Singleton NodeMetricsFactory
    Generates all the available node metrics
 */
var NodeMetricsFactory = (function(){

    var instance, metrics;
    return {
        getInstance: function(){
            if (instance == null) {
                instance = new NodeMetricsFactory();
                instance.constructor = null;
            }
            return instance;
        }
    };


    function NodeMetricsFactory() {
        metrics = buildMetrics();
        this.getMetrics = function() {
            return metrics;
        }
    }

    function buildMetrics() {
        var metrics = [];
        metrics.push(getPhishingMetric());
        metrics.push(getTrackingMetric());
        metrics.push(getLeakingMetric());
        metrics.push(getTrackingCookiesMetric());
        return metrics;
    }

    /*  @Docs Methods used for getting the available metrics
        To create new metric:
        - add new getter here
        - add it to the metrics generated in @buildMetrics method
     */
    function getPhishingMetric() {
        var calculationCallback = function(node, graphStatistics) {
            var outEdges = node.getOutgoingDomainEdges(true).length;
            var inEdges = node.getIncomingDomainEdges(true).length;
            return (1/(1+inEdges+outEdges))*100;
        };

        return new NodeMetric("phishing", "Phishing", 0, 100, calculationCallback);
    }

    function getTrackingMetric() {
        var calculationCallback = function(node, graphStatistics) {
            var maxIncomingEdges = graphStatistics.inEdges.referral.max;
            var inEdges = DomainEdge.groupEdgesByType(node.getIncomingDomainEdges(true))[DomainEdge.Type.REFERRING.name].length;
            return (maxIncomingEdges > 0) ? (inEdges/maxIncomingEdges)*100 : 0;
        };

        return new  NodeMetric("tracking", "Tracking", 0, 100, calculationCallback);
    }

    function getLeakingMetric() {
        var calculationCallback = function(node, graphStatistics) {
            var maxIncomingEdges = graphStatistics.inEdges.referral.max;
            var outEdges = DomainEdge.groupEdgesByType(node.getOutgoingDomainEdges(true))[DomainEdge.Type.REFERRING.name];
            var sum = 0;
            for(var i = 0; i < outEdges.length; i++) {
                var neighbourNode = outEdges[i].getDestinationNode();
                var neighbourIncomingEdges = DomainEdge.groupEdgesByType(neighbourNode.getIncomingDomainEdges(true))[DomainEdge.Type.REFERRING.name].length;
                var neighbourWeight = (maxIncomingEdges > 0) ? Math.pow(neighbourIncomingEdges / maxIncomingEdges,2) : 0;
                sum += neighbourWeight;
            }
            return (outEdges.length > 0) ? (sum/outEdges.length)*100 : 0;
        }

        return new NodeMetric("leaking", "Leaking", 0, 100, calculationCallback);
    }

    function getTrackingCookiesMetric() {
        var calculationCallback = function(node, graphStatistics) {
            var firstPartyCookiesNum = Object.keys(node.getFirstPartyCookies()).length;
            var thirdPartyCookiesNum = Object.keys(node.getThirdPartyCookies()).length;
            var totalCookiesNum = firstPartyCookiesNum + thirdPartyCookiesNum;
            return (totalCookiesNum > 0) ? thirdPartyCookiesNum/totalCookiesNum*100 : 0;
        }

        return new NodeMetric("tracking-cookies", "Tracking Cookies", 0, 100, calculationCallback);
    }
})();

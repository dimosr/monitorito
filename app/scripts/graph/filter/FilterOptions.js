"use strict";

function FilterOptions() {

    //Set default values
    this.domainRegExp = new RegExp(".*");
    this.edges = {
        incoming: {
            min: 0,
            max: Number.MAX_VALUE
        },
        outgoing: {
            min: 0,
            max: Number.MAX_VALUE
        }
    };
    this.metrics = {
        phishing: {
            from: 0,
            to: 100
        },
        tracking: {
            from: 0,
            to: 100
        },
        leaking: {
            from: 0,
            to: 100
        },
        trackingCookies: {
            from: 0,
            to: 100
        }
    };
    this.showNeighboursAtDepth = 0;
}

FilterOptions.prototype.setDomainRegExp = function(domainRegExp) {
    this.domainRegExp = domainRegExp;
}

FilterOptions.prototype.setEdgesMin = function(edgesType, min) {
    if(edgesType != "incoming" && edgesType != "outgoing") throw new Error("Not valid type of edges provided as parameter.");
    this.edges[edgesType].min = min;
}

FilterOptions.prototype.setEdgesMax = function(edgesType, max) {
    if(edgesType != "incoming" && edgesType != "outgoing") throw new Error("Not valid type of edges provided as parameter.");
    this.edges[edgesType].max = max;
}

FilterOptions.prototype.setMetricMin = function(metric, minValue) {
    this.metrics[metric].from = minValue;
}

FilterOptions.prototype.setMetricMax = function(metric, maxValue) {
    this.metrics[metric].to = maxValue;
}

FilterOptions.prototype.setNeighboursDepth = function(maxDepth) {
    this.showNeighboursAtDepth = maxDepth;
}

FilterOptions.prototype.getNeighboursDepth = function() {
    return this.showNeighboursAtDepth;
}

FilterOptions.prototype.satisfiedByNode = function(domainNode, nodeMetrics) {
    var flag = true;
    if(!this.domainRegExp.test(domainNode.getID())) flag = false;
    if(!this.inRange(domainNode.getIncomingDomainEdges(true).length, this.edges.incoming.min, this.edges.incoming.max)) flag = false;
    if(!this.inRange(domainNode.getOutgoingDomainEdges(true).length, this.edges.outgoing.min, this.edges.outgoing.max)) flag = false;
    if(!this.inRange(nodeMetrics.phishing, this.metrics.phishing.from, this.metrics.phishing.to)) flag = false;
    if(!this.inRange(nodeMetrics.tracking, this.metrics.tracking.from, this.metrics.tracking.to)) flag = false;
    if(!this.inRange(nodeMetrics.leaking, this.metrics.leaking.from, this.metrics.leaking.to)) flag = false;
    if(!this.inRange(nodeMetrics.trackingCookies, this.metrics.trackingCookies.from, this.metrics.trackingCookies.to)) flag = false;
    return flag;
}

FilterOptions.prototype.inRange = function(value, min, max) {
    return (value >= min && value <= max);
}
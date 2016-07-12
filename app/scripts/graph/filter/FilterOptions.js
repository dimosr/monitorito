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

    var metrics = {};
    NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
        metrics[metric.getCodeName()] = {
            from: metric.getMinValue(),
            to: metric.getMaxValue()
        };
    });
    this.metrics = metrics;

    this.showNeighboursAtDepth = 0;
}

FilterOptions.prototype.setDomainRegExp = function(domainRegExp) {
    if(!(domainRegExp instanceof RegExp)) throw new Error("Provided parameter is not regular expression");
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

FilterOptions.prototype.setMetricMin = function(metricCodeName, minValue) {
    this.metrics[metricCodeName].from = minValue;
}

FilterOptions.prototype.setMetricMax = function(metricCodeName, maxValue) {
    this.metrics[metricCodeName].to = maxValue;
}

FilterOptions.prototype.setNeighboursDepth = function(maxDepth) {
    this.showNeighboursAtDepth = maxDepth;
}

FilterOptions.prototype.getNeighboursDepth = function() {
    return this.showNeighboursAtDepth;
}

FilterOptions.prototype.satisfiedByNode = function(domainNode, nodeMetrics) {
    var flag = true, filterOptions = this;
    if(!this.domainRegExp.test(domainNode.getID())) flag = false;
    if(!this.inRange(domainNode.getIncomingDomainEdges(true).length, this.edges.incoming.min, this.edges.incoming.max)) flag = false;
    if(!this.inRange(domainNode.getOutgoingDomainEdges(true).length, this.edges.outgoing.min, this.edges.outgoing.max)) flag = false;
    NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
        var metricValue = nodeMetrics[metric.getCodeName()];
        var minLimit = filterOptions.metrics[metric.getCodeName()].from;
        var maxLimit = filterOptions.metrics[metric.getCodeName()].to;
        if(!filterOptions.inRange(metricValue, minLimit, maxLimit)) flag = false;
    });
    return flag;
}

FilterOptions.prototype.inRange = function(value, min, max) {
    return (value >= min && value <= max);
}
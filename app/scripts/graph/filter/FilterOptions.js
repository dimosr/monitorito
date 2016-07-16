"use strict";

function FilterOptions() {

    this.operationType = FilterOptions.operationType.AND;

    //Set default values
    this.default = true;
    this.domainRegExp = null;
    this.edges = {
        incoming: {
            min: null,
            max: null
        },
        outgoing: {
            min: null,
            max: null
        }
    };

    var metrics = {};
    NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
        metrics[metric.getCodeName()] = {
            from: null,
            to: null
        };
    });
    this.metrics = metrics;

    this.showNeighboursAtDepth = 0;
}

FilterOptions.operationType = {
    AND: 1,
    OR: 2
}

FilterOptions.prototype.setDomainRegExp = function(domainRegExp) {
    if(!(domainRegExp instanceof RegExp)) throw new Error("Provided parameter is not regular expression");
    this.domainRegExp = domainRegExp;
    this.default = false;
}

FilterOptions.prototype.setEdgesMin = function(edgesType, min) {
    if(edgesType != "incoming" && edgesType != "outgoing") throw new Error("Not valid type of edges provided as parameter.");
    this.edges[edgesType].min = min;
    this.default = false;
}

FilterOptions.prototype.setEdgesMax = function(edgesType, max) {
    if(edgesType != "incoming" && edgesType != "outgoing") throw new Error("Not valid type of edges provided as parameter.");
    this.edges[edgesType].max = max;
    this.default = false;
}

FilterOptions.prototype.setMetricMin = function(metricCodeName, minValue) {
    this.metrics[metricCodeName].from = minValue;
    this.default = false;
}

FilterOptions.prototype.setMetricMax = function(metricCodeName, maxValue) {
    this.metrics[metricCodeName].to = maxValue;
    this.default = false;
}

FilterOptions.prototype.setNeighboursDepth = function(maxDepth) {
    this.showNeighboursAtDepth = maxDepth;
}

FilterOptions.prototype.getNeighboursDepth = function() {
    return this.showNeighboursAtDepth;
}

FilterOptions.prototype.setOperationType = function(operationType) {
    this.operationType = operationType;
}

FilterOptions.prototype.satisfiedByNode = function(domainNode, nodeMetrics) {
    if(this.operationType == FilterOptions.operationType.AND) return this.allSatisfiedByNode(domainNode, nodeMetrics);
    else if(this.operationType == FilterOptions.operationType.OR) return this.anySatisfiedByNode(domainNode, nodeMetrics);
    else throw new Error("Unsupported operation type");
}

FilterOptions.prototype.allSatisfiedByNode = function(domainNode, nodeMetrics) {
    if(this.default == true) return true;

    var flag = true, filterOptions = this;
    var incomingDomainEdges = domainNode.getIncomingDomainEdges(true).length, outgoingDomainEdges = domainNode.getOutgoingDomainEdges(true).length;

    if(this.domainRegExp != null && !this.domainRegExp.test(domainNode.getID())) flag = false;
    if(this.edges.incoming.min != null && !(incomingDomainEdges >= this.edges.incoming.min)) flag = false;
    if(this.edges.incoming.max != null && !(incomingDomainEdges <= this.edges.incoming.max)) flag = false;
    if(this.edges.outgoing.min != null && !(outgoingDomainEdges >= this.edges.outgoing.min)) flag = false;
    if(this.edges.outgoing.max != null && !(outgoingDomainEdges <= this.edges.outgoing.max)) flag = false;
    NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
        var metricValue = nodeMetrics[metric.getCodeName()];
        var minLimit = filterOptions.metrics[metric.getCodeName()].from;
        var maxLimit = filterOptions.metrics[metric.getCodeName()].to;
        if(minLimit != null && !(metricValue >= minLimit)) flag = false;
        if(maxLimit != null && !(metricValue <= maxLimit)) flag = false;
    });
    return flag;
}

FilterOptions.prototype.anySatisfiedByNode = function(domainNode, nodeMetrics) {
    if(this.default == true) return true;

    var flag = false, filterOptions = this;
    var incomingDomainEdges = domainNode.getIncomingDomainEdges(true).length, outgoingDomainEdges = domainNode.getOutgoingDomainEdges(true).length;

    if(this.domainRegExp != null && this.domainRegExp.test(domainNode.getID())) flag = true;
    if(this.edges.incoming.min != null && (incomingDomainEdges >= this.edges.incoming.min)) flag = true;
    if(this.edges.incoming.max != null && (incomingDomainEdges <= this.edges.incoming.max)) flag = true;
    if(this.edges.outgoing.min != null && (outgoingDomainEdges >= this.edges.outgoing.min)) flag = true;
    if(this.edges.outgoing.max != null && (outgoingDomainEdges <= this.edges.outgoing.max)) flag = true;
    NodeMetricsFactory.getInstance().getMetrics().forEach(function(metric) {
        var metricValue = nodeMetrics[metric.getCodeName()];
        var minLimit = filterOptions.metrics[metric.getCodeName()].from;
        var maxLimit = filterOptions.metrics[metric.getCodeName()].to;
        if(minLimit != null && (metricValue >= minLimit)) flag = true;
        if(maxLimit != null && (metricValue <= maxLimit)) flag = true;
    });
    return flag;
}
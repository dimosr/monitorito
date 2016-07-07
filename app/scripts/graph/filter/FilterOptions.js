"use strict";

function FilterOptions() {

    //Set default values
    this.domainRegExp = new RegExp(".*");
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
    }
    this.showNeighboursAtDepth = 0;
}

FilterOptions.prototype.setDomainRegExp = function(domainRegExp) {
    this.domainRegExp = domainRegExp;
}

FilterOptions.prototype.setPhishingMetric = function(minValue, maxValue) {
    this.metrics.phishing.from = minValue;
    this.metrics.phishing.to = maxValue;
}

FilterOptions.prototype.setTrackingMetric = function(minValue, maxValue) {
    this.metrics.tracking.from = minValue;
    this.metrics.tracking.to = maxValue;
}

FilterOptions.prototype.setLeakingMetric = function(minValue, maxValue) {
    this.metrics.leaking.from = minValue;
    this.metrics.tracking.to = maxValue;
}

FilterOptions.prototype.setTrackingCookiesMetric = function(minValue, maxValue) {
    this.metrics.trackingCookies.from = minValue;
    this.metrics.trackingCookies.to = maxValue;
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
    if(!this.inRange(nodeMetrics.phishing, this.metrics.phishing.from, this.metrics.phishing.to)) flag = false;
    if(!this.inRange(nodeMetrics.tracking, this.metrics.tracking.from, this.metrics.tracking.to)) flag = false;
    if(!this.inRange(nodeMetrics.leaking, this.metrics.leaking.from, this.metrics.leaking.to)) flag = false;
    if(!this.inRange(nodeMetrics.trackingCookies, this.metrics.trackingCookies.from, this.metrics.trackingCookies.to)) flag = false;
    return flag;
}

FilterOptions.prototype.inRange = function(value, min, max) {
    return (value >= min && value <= max);
}
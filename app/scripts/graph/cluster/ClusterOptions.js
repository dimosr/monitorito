"use strict";

function ClusterOptions(operationType) {
    if(operationType === undefined || (operationType != ClusterOptions.operationType.DOMAINS && operationType != ClusterOptions.operationType.REGEXP))
        throw new Error("operationType not provided");

    this.operationType = operationType;

    this.domains = null;
    this.subDomainsRegexp = null;

    this.userRegExp = null;
}

ClusterOptions.operationType = {
    DOMAINS: 1,
    REGEXP: 2
}

ClusterOptions.prototype.setDomains = function(domains) {
    if(!(domains instanceof Array)) throw new Error("Provided parameter is not array.");
    this.domains = domains;
    this.subDomainsRegexp = new RegExp("^((.+[.])?)(domains)$".replace("domains", this.domains.join("|")));
}

ClusterOptions.prototype.setRegExp = function(regExp) {
    if(!(regExp instanceof RegExp)) throw new Error("Provided parameter is not regular expression.");
    this.userRegExp = regExp;
}

ClusterOptions.prototype.belongsInCluster = function(node) {
    if(!node instanceof DomainNode) throw new Error("Clustering applicable only on Domain Nodes");

    if(this.operationType == ClusterOptions.operationType.DOMAINS)
        return this.subDomainsRegexp.test(node.getDomain());
    else if(this.operationType == ClusterOptions.operationType.REGEXP)
        return this.userRegExp.test(node.getDomain());
    else
        throw new Error("Clustering cannot be applied without valid operationType.")
}
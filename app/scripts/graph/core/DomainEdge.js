"use strict";

function DomainEdge(id, fromNode, toNode, graph, networkEdges) {
    Edge.call(this, id, fromNode, toNode, graph, networkEdges);

    this._links = {
        "requests": [],
        "redirects": [],
        "referrals": []
    };
    this.type = DomainEdge.Type.DEFAULT;

    this.createVisualEdge();
}

DomainEdge.prototype = Object.create(Edge.prototype);

DomainEdge.Type = {
    DEFAULT: {name: "Default", rank: 4,dashes: false, color: "grey"},
    REQUEST: {name: "Request", rank: 2,dashes: false, color: "grey"},
    REDIRECT: {name: "Redirect", rank: 3,dashes: true, color: "grey"},
    REFERRAL: {name: "Referral", rank: 1,dashes: false, color: "red"}
}

DomainEdge.prototype.addRequest = function(fromURL, request) {
    this._links.requests.push({from: fromURL, request: request});
    if(this.type.rank > DomainEdge.Type.REQUEST.rank) this.updateType(DomainEdge.Type.REQUEST);
}

DomainEdge.prototype.getRequests = function() {
    return this._links.requests;
}

DomainEdge.prototype.addRedirect = function(redirect) {
    this._links.redirects.push(redirect);
    if(this.type.rank > DomainEdge.Type.REDIRECT.rank) this.updateType(DomainEdge.Type.REDIRECT);
}

DomainEdge.prototype.getRedirects = function() {
    return this._links.redirects;
}

DomainEdge.prototype.addReferral = function(fromURL, request) {
    this._links.referrals.push({from: fromURL, request: request});
    if(this.type.rank > DomainEdge.Type.REFERRAL.rank) this.updateType(DomainEdge.Type.REFERRAL);
}

DomainEdge.prototype.getReferrals = function() {
    return this._links.referrals;
}

DomainEdge.prototype.getType = function() {
    return this.type;
}

DomainEdge.prototype.createVisualEdge = function(){
    var options = {
        id: this.getID(),
        arrows: {
            to: {scaleFactor: 1}
        },
        from: this._from.getID(),
        to: this._to.getID(),
        width: 3,
        dashes: this.type.dashes,
        color: this.type.color
    };
    Edge.prototype.createVisualEdge.call(this, options);
}

DomainEdge.prototype.updateVisualEdgeType = function() {
    var options = {
        id: this.getID(),
        dashes: this.type.dashes,
        color: this.type.color
    };
    Edge.prototype.updateVisualEdgeType.call(this, options);
}

DomainEdge.prototype.updateType = function(type) {
    var previousType = this.type, newType = type;

    this.type = newType;
    this.updateVisualEdgeType();

    this.notifyForChange(previousType, newType);
}

DomainEdge.groupEdgesByType = function(edges) {
    var groupedEdges = {};
    for(var key in DomainEdge.Type) {
        var type = DomainEdge.Type[key];
        groupedEdges[type.name] = [];
    }
    for(var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        groupedEdges[edge.getType().name].push(edge);
    }
    return groupedEdges;
}
"use strict";

function DomainEdge(id, fromNode, toNode, graph, networkEdges) {
    Edge.call(this, id, fromNode, toNode, graph, networkEdges);

    this._links = {};
    for(var key in DomainEdge.Type) {
        var type = DomainEdge.Type[key];
        this._links[type.name] = [];
    }
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

DomainEdge.prototype.addLink = function(fromURL, link, linkType) {
    this._links[linkType.name].push({from: fromURL, link: link});
    if(this.type.rank > linkType.rank) this.updateType(linkType);
}

DomainEdge.prototype.getLinks = function(linkType) {
    if(linkType === undefined) return this._links;
    return this._links[linkType.name];
}

DomainEdge.prototype.getType = function() {
    return this.type;
}

DomainEdge.prototype.createVisualEdge = function(){
    var options = {
        arrows: {
            to: {scaleFactor: 1}
        },
        width: 3,
        dashes: this.type.dashes,
        color: this.type.color
    };
    Edge.prototype.createVisualEdge.call(this, options);
}

DomainEdge.prototype.updateVisualEdgeType = function() {
    var options = {
        dashes: this.type.dashes,
        color: this.type.color
    };
    Edge.prototype.updateVisualEdge.call(this, options);
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
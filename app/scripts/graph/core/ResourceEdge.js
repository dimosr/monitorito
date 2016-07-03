"use strict";

function ResourceEdge(id, fromNode, toNode, graph, networkEdges) {
    Edge.call(this, id, fromNode, toNode, graph, networkEdges);

    this._links = {};
    for(var key in ResourceEdge.Type) {
        var type = ResourceEdge.Type[key];
        this._links[type.name] = [];
    }
    this.type = ResourceEdge.Type.DEFAULT;

    this.createVisualEdge();
}

ResourceEdge.prototype = Object.create(Edge.prototype);

ResourceEdge.Type = {
    DEFAULT: {name: "Default", rank: 4,dashes: false, color: "#77773c"},
    REQUEST: {name: "Request", rank: 2,dashes: false, color: "#77773c"},
    REDIRECT: {name: "Redirect", rank: 3,dashes: true, color: "#77773c"},
    REFERRAL: {name: "Referral", rank: 1,dashes: false, color: "#FF8000"}
}

ResourceEdge.prototype.addLink = function(fromURL, link, linkType) {
    this._links[linkType.name].push({from: fromURL, link: link});
    if(this.type.rank > linkType.rank) this.updateType(linkType);
}

ResourceEdge.prototype.getLinks = function(linkType) {
    if(linkType === undefined) return this._links;
    return this._links[linkType.name];
}

ResourceEdge.prototype.getType = function() {
    return this.type;
}

ResourceEdge.prototype.createVisualEdge = function(){
    var options = {
        id: this.getID(),
        arrows: {
            to: {scaleFactor: 1}
        },
        from: this._from.getID(),
        to: this._to.getID(),
        width: 3,
        color: this.type.color
    };
    Edge.prototype.createVisualEdge.call(this, options);
}

/* No need to notify GraphStatsCalculator, as for DomainEdge */
ResourceEdge.prototype.updateType = function(type) {
    this.type = type;
    this.updateVisualEdgeType();
}

ResourceEdge.prototype.updateVisualEdgeType = function() {
    var options = {
        id: this.getID(),
        dashes: this.type.dashes,
        color: this.type.color
    };
    Edge.prototype.updateVisualEdge.call(this, options);
}
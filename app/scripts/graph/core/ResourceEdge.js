"use strict";

function ResourceEdge(id, fromNode, toNode, graph, networkEdges) {
    DomainEdge.call(this, id, fromNode, toNode, graph, networkEdges);
}

ResourceEdge.prototype = Object.create(DomainEdge.prototype);
ResourceEdge.prototype.constructor = ResourceEdge;

ResourceEdge.prototype.createVisualEdge = function(){
    var options = {
        arrows: {
            to: {scaleFactor: 1}
        },
        width: 3,
        color: this.type.color.resource
    };
    Edge.prototype.createVisualEdge.call(this, options);
}

ResourceEdge.prototype.updateVisualEdgeType = function() {
    var options = {
        color: this.type.color.resource
    };
    Edge.prototype.updateVisualEdge.call(this, options);
}

/* No need to notify GraphStatsCalculator, as for DomainEdge */
ResourceEdge.prototype.updateType = function(type) {
    this.type = type;
    this.updateVisualEdgeType();
}
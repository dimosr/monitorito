"use strict";

function ResourceEdge(id, fromNode, toNode, graph, networkEdges) {
    DomainEdge.call(this, id, fromNode, toNode, graph, networkEdges);
}

ResourceEdge.prototype = Object.create(DomainEdge.prototype);

/* No need to notify GraphStatsCalculator, as for DomainEdge */
ResourceEdge.prototype.updateType = function(type) {
    this.type = type;
    this.updateVisualEdgeType();
}

ResourceEdge.prototype.move = function(newSrcNode, newDstNode) {
    this.getSourceNode().removeEdgeTo(this.getDestinationNode());
    this.getDestinationNode().removeEdgeFrom(this.getSourceNode());

    newSrcNode.addEdgeTo(newDstNode, this);
    newDstNode.addEdgeFrom(newSrcNode, this);

    var options = {
        from: newSrcNode.getID(),
        to: newDstNode.getID()
    };
    this.updateVisualEdgeType(options);
}
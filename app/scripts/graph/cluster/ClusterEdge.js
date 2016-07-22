"use strict";

/*  @Docs
    A ClusterEdge is a DomainEdge, where either sourceNode or destinationNode is cluster
 */
function ClusterEdge(id, fromNode, toNode, graph) {
    DomainEdge.call(this, id, fromNode, toNode, graph);
}

ClusterEdge.prototype = Object.create(DomainEdge.prototype);

/*  @Docs
    No notifications are sent for ClusterEdges
 */
ClusterEdge.prototype.updateType = function(type) {
    this.type = type;
    this.updateVisualEdgeType();
}
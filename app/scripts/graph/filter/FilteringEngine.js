"use strict";

function FilteringEngine(graph, graphStatsCalculator) {
    this.graph = graph;
    this.graphStatsCalculator = graphStatsCalculator;

    this.active = false;
}

FilteringEngine.prototype.isFilterActive = function() {
    return this.active;
}

/*  @Docs
    Applies the filterOptions to the graph
    - First, gets all the currently visible nodes (existing from previous filters)
    - Hides all of these nodes and their edges
    - Iterates over them and maintains the set of the matched nodes
    - Then, shows only the matched nodes and edges between matched nodes
    Note: Clusters should be deleted before applying the filter, for compatibility
 */
FilteringEngine.prototype.filter = function(filterOptions) {
    var visibleDomainNodes = this.graph.getDomainNodes().filter(function(node) {return node.isVisible()});
    this._hideNodesWithEdges(visibleDomainNodes);
    this.matchedNodes = {};

    for(var i = 0; i < visibleDomainNodes.length; i++) {
        var domainNode = visibleDomainNodes[i];
        if(filterOptions.satisfiedByNode(domainNode, this.graphStatsCalculator.getNodeMetrics(domainNode))) {
            this.traverseDomainNodeEnvironment(domainNode, filterOptions.getNeighboursDepth());
        }
    }
    this.showMatchedNodesAndEdges();
    
    this.active = true;
}

/*  @Docs
    Resets the filtering, showing again all nodes and edges of the graph
    Note: Clusters should be deleted before reseting the filter, for compatibility
 */
FilteringEngine.prototype.resetFilter = function() {
    this.graph.getNodes().map(function(node){ node.show();});
    this.graph.getEdges().map(function(edge){ edge.show();});

    this.active = false;
}

/*  @Docs
    Hides all domainNodes, corresponding to parameter nodes
    Hides also:
    - their edges
    - their children resource nodes
    - the edges of their children resource nodes
 */
FilteringEngine.prototype._hideNodesWithEdges = function(nodes) {
    nodes.forEach(function(node) {
        node.hide();
        node.getOutgoingEdges().map(function(edge) {edge.hide();});
        node.getIncomingEdges().map(function(edge) {edge.hide();});
        node.getChildrenNodes().map(function(resourceNode) {
            resourceNode.hide();
            resourceNode.getOutgoingEdges().map(function(resourceEdge) {resourceEdge.hide()});
            resourceNode.getIncomingEdges().map(function(resourceEdge) {resourceEdge.hide()});
        });
    });
}

/*  @Docs
    Traverses a domainNode and its environment:
    @param environmentDepth: defines the depth to which neighbours will be recursively shown
    - Neighbour DomainNodes
 */
FilteringEngine.prototype.traverseDomainNodeEnvironment = function(domainNode, environmentDepth) {
    var filteringEngine = this;

    this.matchedNodes[domainNode.getID()] = domainNode;
    domainNode.getIncomingDomainEdges().map(function(edge) {
        if(environmentDepth > 0){
            filteringEngine.traverseDomainNodeEnvironment(edge.getSourceNode(), environmentDepth-1);
        }
    });
    domainNode.getOutgoingDomainEdges().map(function(edge) {
        if(environmentDepth > 0){
            filteringEngine.traverseDomainNodeEnvironment(edge.getDestinationNode(), environmentDepth-1);
        }
    });
}

/*  @Docs
 Shows all domainNodes, corresponding to parameter nodes
 Shows also:
 - their edges (if the other node is also visible)
 - their children resource nodes
 - the edges of their children resource nodes (if the other node is also visible)
 */
FilteringEngine.prototype.showMatchedNodesAndEdges = function() {
    var matchedNodes = this.matchedNodes;
    for(var key in matchedNodes) {
        var node = matchedNodes[key];
        node.show();
        node.getChildrenNodes().map(function(resourceNode) {
            resourceNode.show();
        });
    }
    this.graph.getEdges().forEach(function(edge) {
        if(edge.getDestinationNode().isVisible() && edge.getSourceNode().isVisible()) edge.show();
    });
}
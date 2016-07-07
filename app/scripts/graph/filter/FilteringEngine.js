"use strict";

function FilteringEngine(graph, graphStatsCalculator) {
    this.graph = graph;
    this.graphStatsCalculator = graphStatsCalculator;

    this.isFilterActive = false;
}

/*  @Docs
    Applies the filterOptions to the graph
    - First, resets the filtering on the graph
    - Then, hides any part of the graph that does not match the filter options
    Note: Clusters should be deleted before applying the filter, for compatibility
 */
FilteringEngine.prototype.filter = function(filterOptions) {
    this.__hideAllGraph();
    this.matchedNodes = {};

    var domainNodes = this.graph.getDomainNodes();
    for(var i = 0; i < domainNodes.length; i++) {
        var domainNode = domainNodes[i];
        if(filterOptions.satisfiedByNode(domainNode, this.graphStatsCalculator.getNodeMetrics(domainNode))) {
            this.traverseDomainNodeEnvironment(domainNode, filterOptions.getNeighboursDepth());
        }
    }
    this.showMatchedNodesAndEdges();
    
    this.isFilterActive = true;
}

/*  @Docs
    Resets the filtering, showing again all nodes and edges of the graph
    Note: Clusters should be deleted before reseting the filter, for compatibility
 */
FilteringEngine.prototype.resetFilter = function() {
    this.graph.getNodes().map(function(node){ node.show();});
    this.graph.getEdges().map(function(edge){ edge.show();});

    this.isFilterActive = false;
}

FilteringEngine.prototype.__hideAllGraph = function() {
    this.graph.getNodes().map(function(node){ node.hide();});
    this.graph.getEdges().map(function(edge){ edge.hide();});
}

/*  @Docs
    Traverses a domainNode and its environment:
    @param environmentDepth: defines the depth to which neighbours will be recursively shown
    - ResourceNodes
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
    domainNode.getChildrenNodes().map(function(resourceNode) {
        filteringEngine.matchedNodes[resourceNode.getID()] = resourceNode;
    });
}

FilteringEngine.prototype.showMatchedNodesAndEdges = function() {
    var matchedNodes = this.matchedNodes;
    for(var key in matchedNodes) {
        var node = matchedNodes[key];
        node.show();
        node.getOutgoingEdges().map(function(edge) {
           if(edge.getDestinationNode().getID() in matchedNodes) edge.show();
        });
        node.getIncomingEdges().map(function(edge) {
            if(edge.getSourceNode().getID() in matchedNodes) edge.show();
        });
    }
}
"use strict";

function FilteringEngine(graph, graphStatsCalculator) {
    this.graph = graph;
    this.graphStatsCalculator = graphStatsCalculator;

    this.active = false;
}

FilteringEngine.operationType = {
    SHOW: 1,        /* Show all the matched nodes & edges */
    HIDE: 2         /* Hide all the matched nodes & edges */
}

FilteringEngine.prototype.isFilterActive = function() {
    return this.active;
}

FilteringEngine.prototype.filter = function(filterOptions, operationType) {
    if(operationType == FilteringEngine.operationType.SHOW) this.showMatched(filterOptions);
    else if(operationType == FilteringEngine.operationType.HIDE) this.hideMatched(filterOptions);
    else throw new Error("FilteringEngine.operationType parameter provided is not valid");
}

/*  @Docs
    Applies the filterOptions to the graph and maintains the matched nodes
    - First, gets all the currently visible nodes (existing from previous filters)
    - Hides all of these nodes and their edges
    - Iterates over them and calculates the set of the matched nodes
    - Then, shows only the matched nodes and edges between matched nodes
 */
FilteringEngine.prototype.showMatched = function(filterOptions) {
    var filterableNodes = this._getFilterableNodes();
    this._hideNodesWithEdges(filterableNodes);
    this.matchedNodes = {};

    filterableNodes.forEach(function(node) {
        if(filterOptions.satisfiedByNode(node, this.graphStatsCalculator.getNodeMetrics(node)))
            this.traverseDomainNodeEnvironment(node, filterOptions.getNeighboursDepth());
    }, this);
    this.showMatchedNodesAndEdges();
    
    this.active = true;
}

/*  @Docs
    Applies the filterOptions to the graph and maintains the matched nodes
    - First, gets all the currently visible nodes (existing from previous filters)
    - Hides all of these nodes and their edges
    - Iterates over them and calculates the set of the matched nodes
    - Then, hides only the matched nodes and edges between matched nodes
 */
FilteringEngine.prototype.hideMatched = function(filterOptions) {
    var filterableNodes = this._getFilterableNodes();
    this.matchedNodes = {};

    filterableNodes.forEach(function(node) {
        if(filterOptions.satisfiedByNode(node, this.graphStatsCalculator.getNodeMetrics(node)))
            this.traverseDomainNodeEnvironment(node, filterOptions.getNeighboursDepth());
    }, this);
    this.hideMatchedNodesAndEdges();

    this.active = true;
}

/*  @Docs
    Resets the filtering, showing again all nodes and edges of the graph for:
    - ResourceNodes
    - Clusters
    - Domain Nodes (except the clustered ones that are detached)
 */
FilteringEngine.prototype.resetFilter = function() {
    this.graph.getNodes()
        .filter(function(node) {
            if (node instanceof DomainNode) return !node.isClustered();
            else return true;
        })
        .map(function(node){
            node.show();
            node.getOutgoingEdges()
                .filter(function(edge) { return !edge.isDetached(); })
                .forEach(function(edge) {
                edge.show();
            });
            node.getIncomingEdges()
                .filter(function(edge) { return !edge.isDetached(); })
                .forEach(function(edge) {
                edge.show();
            });
        });
    this.active = false;
}

/*  @Docs
    Hides all nodes provided
    Hides also:
    - their edges
    - their children resource nodes (if domain nodes)
    - the edges of their children resource nodes (if domain nodes)
 */
FilteringEngine.prototype._hideNodesWithEdges = function(nodes) {
    nodes.forEach(function(node) {
        node.hide();
        node.getOutgoingEdges().map(function(edge) {edge.hide();});
        node.getIncomingEdges().map(function(edge) {edge.hide();});
        if(node instanceof DomainNode) {
            node.getChildrenNodes().map(function (resourceNode) {
                resourceNode.hide();
                resourceNode.getOutgoingEdges().map(function (resourceEdge) {
                    resourceEdge.hide();
                });
                resourceNode.getIncomingEdges().map(function (resourceEdge) {
                    resourceEdge.hide();
                });
            });
        }
    });
}

/*  @Docs
    Traverses a node and its resourceNodes and recursively its neighbour nodes (domain & cluster) and populates matchedNodes field
    @param environmentDepth: defines the depth to which neighbours will be recursively traversed
 */
FilteringEngine.prototype.traverseDomainNodeEnvironment = function(node, environmentDepth) {
    var filteringEngine = this;
    this.matchedNodes[node.getID()] = node;
    if(node instanceof DomainNode) {
        node.getChildrenNodes().forEach(function (resourceNode) {
            this.matchedNodes[resourceNode.getID()] = resourceNode;
        }, this);
    }

    node.getIncomingDomainEdges().map(function(edge) {
        if(environmentDepth > 0){
            filteringEngine.traverseDomainNodeEnvironment(edge.getSourceNode(), environmentDepth-1);
        }
    });
    node.getOutgoingDomainEdges().map(function(edge) {
        if(environmentDepth > 0){
            filteringEngine.traverseDomainNodeEnvironment(edge.getDestinationNode(), environmentDepth-1);
        }
    });
}

/*  @Docs
    Shows all nodes matched by the applied filter (clusters, domainNodes & resourceNodes)
    Shows also:
    - their edges (if the other node is also matched)
 */
FilteringEngine.prototype.showMatchedNodesAndEdges = function() {
    var matchedNodes = this.matchedNodes;
    for(var key in matchedNodes) {
        var node = matchedNodes[key];
        node.show();
        node.getOutgoingEdges().forEach(function(edge) {
            if(edge.getDestinationNode().getID() in matchedNodes) edge.show();
        }, this);
        node.getIncomingEdges().forEach(function(edge) {
            if(edge.getSourceNode().getID() in matchedNodes) edge.show();
        }, this);
    }
}

/*  @Docs
    Hides all nodes matched by the applied filter (clusters, domainNodes & resourceNodes)
    Hides also:
    - their edges (if the other node is also matched)
 */
FilteringEngine.prototype.hideMatchedNodesAndEdges = function() {
    var matchedNodes = this.matchedNodes;
    for(var key in matchedNodes) {
        var node = matchedNodes[key];
        node.hide();
        node.getOutgoingEdges().forEach(function(edge) { edge.hide(); });
        node.getIncomingEdges().forEach(function(edge) { edge.hide(); });
    }
}

/*  @Docs
    Returns all nodes valid for filtering:
    - Non-clustered domain nodes, not filtered out by previous filters
    - Clusters
 */
FilteringEngine.prototype._getFilterableNodes = function() {
    return this.graph.getNodes()
                     .filter(function(node) { return node.isVisible(); })
                     .filter(function(node) {
                          return (node instanceof Cluster) ||
                                 ((node instanceof DomainNode) && (!node.isClustered()) );
                     });
}
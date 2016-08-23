"use strict";

/*  @Docs
    Manipulates the Graph, extracting domain Resources
    and creating edges between them
 */
function ResourcesExplorerEngine(graph) {
    this.graph = graph;

    this.expandedDomainNodes = {};
}
/*  @Docs
    Expands a DomainNode, creating ResourceNodes and ResourceEdges
    - Creates a ResourceNode for each request of a DomainNode
    - Creates a ResourceEdge between:
        - ResourceNodes belonging to the same expanded DomainNode
        - ResourceNodes belonging to different domainNodes that are all expanded
        - ResourceNode belonging to expanded DomainNode and DomainNodes that have not been expanded
 */
ResourcesExplorerEngine.prototype.expand = function(domainNode) {
    if(!(domainNode instanceof DomainNode) || (domainNode.isClustered())) throw new Error("Only domain nodes (that are not clustered) can be expanded.");
    domainNode.setExpanded(true);
    this.expandedDomainNodes[domainNode.getID()] = domainNode;

    var requests = domainNode.getRequests();
    for(var i = 0; i < requests.length; i++) {
        var request = requests[i];
        var node = this._ensureResourceNodeExists(request.url);
        node.addRequest(request);
    }

    var inEdges = domainNode.getIncomingDomainEdges(false);
    for(var i = 0; i < inEdges.length; i++) {
        if((inEdges[i].getSourceNode() == domainNode))
            this.processResourceEdges(inEdges[i], "create");
        else if(inEdges[i].getSourceNode().isExpanded())
            this.processResourceEdges(inEdges[i], "moveFromSource");
        else if(!inEdges[i].getSourceNode().isExpanded()) {
            this.processResourceEdges(inEdges[i], "addFromDomain");
        }
    }

    var outEdges = domainNode.getOutgoingDomainEdges(true);
    for(var i = 0; i < outEdges.length; i++) {
        if(!outEdges[i].getDestinationNode().isExpanded())
            this.processResourceEdges(outEdges[i], "addToDomain");
        else if(outEdges[i].getDestinationNode().isExpanded())
            this.processResourceEdges(outEdges[i], "moveToDestination");
    }

}

/*  @Docs
    Collapses a DomainNode, hiding ResourceNodes
    - Deletes all ResourceNodes of the collapsed DomainNode
    - Deletes ResourceEdges between ResourceNodes belonging to the same domain
    - Deletes ResourceEdges, if their other side belongs to non expanded DomainNode
    - Move ResourceEdges to DomainNode, if their other side belongs to expanded DomainNode
 */
ResourcesExplorerEngine.prototype.collapse = function(domainNode) {
    if(!(domainNode instanceof DomainNode) || (domainNode.isClustered())) throw new Error("Only domain nodes (that are not clustered) can be collapsed.");

    domainNode.setExpanded(false);
    delete this.expandedDomainNodes[domainNode.getID()];

    var resourceNodes = domainNode.getChildrenNodes();
    for(var i = 0; i < resourceNodes.length; i++) {
        var node = resourceNodes[i];
        var inEdges = node.getIncomingEdges(false);
        var outEdges = node.getOutgoingEdges(true);

        for(var j = 0; j < inEdges.length; j++) {
            if(!(inEdges[j].getSourceNode() instanceof ResourceNode)) this.removeResourceEdge("delete", inEdges[j]);
            else {
                if(Util.getUrlHostname(inEdges[j].getSourceNode().getID()) == Util.getUrlHostname(inEdges[j].getDestinationNode().getID())) this.removeResourceEdge("delete", inEdges[j]);
                else this.removeResourceEdge("moveToDestination", inEdges[j]);
            }
        }
        for(var j = 0; j < outEdges.length; j++) {
            if(!(outEdges[j].getDestinationNode() instanceof ResourceNode)) this.removeResourceEdge("delete", outEdges[j]);
            else {
                if(Util.getUrlHostname(outEdges[j].getSourceNode().getID()) == Util.getUrlHostname(outEdges[j].getDestinationNode().getID())) this.removeResourceEdge("delete", outEdges[j]);
                else this.removeResourceEdge("moveToSource", outEdges[j]);
            }
        }
        this.graph.deleteNode(node.getID());
    }
}

ResourcesExplorerEngine.prototype.processResourceEdges = function(domainEdge, mode) {
    var requests = domainEdge.getLinks(DomainEdge.LinkType.REQUEST);
    var referrals = domainEdge.getLinks(DomainEdge.LinkType.REFERRAL);
    var redirects = domainEdge.getLinks(DomainEdge.LinkType.REDIRECT);

    for(var i = 0; i < requests.length; i++)
        this.processResourceEdge(mode, requests[i].from, requests[i].link.url, requests[i].link, DomainEdge.LinkType.REQUEST);
    for(var i = 0; i < referrals.length; i++)
        this.processResourceEdge(mode, referrals[i].from, referrals[i].link.url, referrals[i].link, DomainEdge.LinkType.REFERRAL);
    for(var i = 0; i < redirects.length; i++)
        this.processResourceEdge(mode, redirects[i].from, redirects[i].link.getFinalURL(), redirects[i].link, DomainEdge.LinkType.REDIRECT);
}

/*  @Docs
    Process a new resourceEdge of an expanded DomainNode. The value of mode represents each case:
    - "create": both sides of edge belong to the same DomainNode
    - "moveFromSource": sourceNode of edge belongs to other DomainNode, that is expanded (so existing edge srcResource->dstDomain moved to srcResource->dstResource)
    - "moveToDestination": destinationNode of edge belongs to other DomainNode, that is expanded (so existing edge srcDomain->dstResource is moved to srcResource->dstResource)
    - "addFromDomain": sourceNode of edge belongs to other DomainNode, that is not expanded (so a new edge is created srcDomain->dstResource)
    - "addToDomain": destinationNode of edge belongs to other DomainNode, that is not expanded (so a new edge is created srcResource->dstDomain)
 */
ResourcesExplorerEngine.prototype.processResourceEdge = function(mode, fromResourceURL, toResourceURL, linkToAdd, linkType) {
    if(mode == "create") {
        this._ensureResourceNodeExists(toResourceURL);
        this._ensureResourceNodeExists(fromResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "moveFromSource") {
        this._ensureResourceNodeExists(fromResourceURL);
        this._ensureResourceNodeExists(toResourceURL);
        this._ensureResourceEdgeNotExists(fromResourceURL, this.getResourceParent(toResourceURL).getID());
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "moveToDestination") {
        this._ensureResourceNodeExists(fromResourceURL);
        this._ensureResourceEdgeNotExists(this.getResourceParent(fromResourceURL).getID(), toResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "addFromDomain") {
        this._ensureResourceNodeExists(toResourceURL);
        var edge = this._ensureResourceEdgeExists(this.getResourceParent(fromResourceURL).getID(), toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "addToDomain") {
        this._ensureResourceNodeExists(fromResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, this.getResourceParent(toResourceURL).getID());
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }

    if(["create", "addFromDomain", "addToDomain"].indexOf(mode) >= 0) { //when creating new ResourceEdge
        var edge = this.getInterDomainEdge(this.getResourceParent(fromResourceURL), this.getResourceParent(toResourceURL));
        edge.hide();
        edge.lock();
    }
}

/*  @Docs
    Returns the "parent" of a resource:
    - Returns the domain node, if it is not clustered
    - Returns the cluster of the domain node, if it is clustered
 */
ResourcesExplorerEngine.prototype.getResourceParent = function(resourceURL) {
    var domainNode = this.graph.getNode(Util.getUrlHostname(resourceURL));
    if(domainNode.isClustered()) return domainNode.getCluster();
    else return domainNode;
}

/*  @Docs
    Process a removal of resourceEdge of a collapsed DomainNode. The value of mode represents each case:
    - "delete": both sides of the edge belong to the same DomainNode, or 1 side belongs to other DomainNode, that is collapsed (so edge is deleted)
    - "moveToDestination": sourceNode of edge belongs to other DomainNode,that is expanded (so move edge srcResource->dstResource to srcResource->dstDomain)
    - "moveToSource": destinationNode of edge belongs to other DomainNode, that is expanded (so move edge srcResource->dstResource to srcDomain->dstResource)
 */
ResourcesExplorerEngine.prototype.removeResourceEdge = function(mode, edge) {
    if(mode == "delete") {
        this.graph.deleteEdge(edge.getID());
    }
    else if(mode == "moveToDestination") {
        this._ensureResourceEdgeNotExists(edge.getSourceNode().getID(), edge.getDestinationNode().getID());
        var newEdge = this._ensureResourceEdgeExists(edge.getSourceNode().getID(), Util.getUrlHostname(edge.getDestinationNode().getID()));
        newEdge.getLinksFromEdge(edge);
    }
    else if(mode == "moveToSource") {
        this._ensureResourceEdgeNotExists(edge.getSourceNode().getID(), edge.getDestinationNode().getID());
        var newEdge = this._ensureResourceEdgeExists(Util.getUrlHostname(edge.getSourceNode().getID()), edge.getDestinationNode().getID());
        newEdge.getLinksFromEdge(edge);
    }

    if(mode == "delete") {
        var edge = this.getInterDomainEdge(edge.getSourceNode(), edge.getDestinationNode());
        edge.unlock();
        edge.checkAndShow();
    }
}

ResourcesExplorerEngine.prototype._ensureResourceNodeExists = function(resourceURL) {
    if(!this.graph.existsNode(resourceURL)) this.graph.createResourceNode(resourceURL);
    return this.graph.getNode(resourceURL);
}

ResourcesExplorerEngine.prototype._ensureResourceEdgeExists = function(fromNodeID, toNodeID) {
    if(!this.graph.existsEdge(fromNodeID, toNodeID)) this.graph.createResourceEdge(fromNodeID, toNodeID);
    return this.graph.getEdgeBetweenNodes(fromNodeID, toNodeID);
}

ResourcesExplorerEngine.prototype._ensureResourceEdgeNotExists = function(fromNodeID, toNodeID) {
    if(this.graph.existsEdge(fromNodeID, toNodeID)) this.graph.deleteEdge(this.graph.getEdgeBetweenNodes(fromNodeID, toNodeID).getID());
}

ResourcesExplorerEngine.prototype.getInterDomainEdge = function(srcNode, dstNode) {
    var srcNode = (srcNode instanceof ResourceNode) ? srcNode.getParentNode() : srcNode;
    var dstNode = (dstNode instanceof ResourceNode) ? dstNode.getParentNode() : dstNode;
    return this.graph.getEdgeBetweenNodes(srcNode.getID(), dstNode.getID());
}

ResourcesExplorerEngine.prototype.getExpandedDomainNodes = function() {
    var nodes = [];
    for(var key in this.expandedDomainNodes) {
        nodes.push(this.expandedDomainNodes[key]);
    }
    return nodes;
}

ResourcesExplorerEngine.prototype.collapseAllNodes = function() {
    var expandedNodes = this.getExpandedDomainNodes();
    for(var i = 0; i < expandedNodes.length; i++) {
        if(expandedNodes[i].isVisible())this.collapse(expandedNodes[i]);
    }
}

/*  @Docs
    Expands all the visible Domain Nodes (non-clustered nodes in the current filter)
 */
ResourcesExplorerEngine.prototype.expandAllNodes = function() {
    var nodes = this.graph.getDomainNodes();
    for(var i = 0; i < nodes.length; i++) {
        if(nodes[i].isVisible() && (!nodes[i].isExpanded())) this.expand(nodes[i]);
    }
}
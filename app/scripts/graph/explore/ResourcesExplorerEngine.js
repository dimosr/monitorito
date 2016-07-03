"use strict";

/*  @Docs
    Manipulates the Graph, extracting domain Resources
    and creating edges between them
 */
function ResourcesExplorerEngine(graph) {
    this.graph = graph;
}

ResourcesExplorerEngine.prototype.expand = function(domainNode) {
    domainNode.setExpanded(true);

    var requests = domainNode.getRequests();
    for(var i = 0; i < requests.length; i++) {
        var request = requests[i];
        if(request.type == HttpRequest.Type.ROOT) {
            var node = this._ensureResourceNodeExists(request.url);
            node.addRequest(request);
        }
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

ResourcesExplorerEngine.prototype.collapse = function(domainNode) {
    domainNode.setExpanded(false);

    var resourceNodes = domainNode.getChildrenNodes();
    for(var i = 0; i < resourceNodes.length; i++) {
        var node = resourceNodes[i];
        var inEdges = node.getIncomingEdges(false);
        var outEdges = node.getOutgoingEdges(true);

        for(var j = 0; j < inEdges.length; j++) {
            if(inEdges[j].getSourceNode() instanceof DomainNode) this.removeResourceEdge("delete", inEdges[j]);
            else {
                if(Util.getUrlHostname(inEdges[j].getSourceNode().getID()) == Util.getUrlHostname(inEdges[j].getDestinationNode().getID())) this.removeResourceEdge("delete", inEdges[j]);
                else this.removeResourceEdge("moveToDestination", inEdges[j]);
            }
        }
        for(var j = 0; j < outEdges.length; j++) {
            if(outEdges[j].getDestinationNode() instanceof DomainNode) this.removeResourceEdge("delete", outEdges[j]);
            else {
                if(Util.getUrlHostname(outEdges[j].getSourceNode().getID()) == Util.getUrlHostname(outEdges[j].getDestinationNode().getID())) this.removeResourceEdge("delete", outEdges[j]);
                else this.removeResourceEdge("moveToDestination", outEdges[j]);
            }
        }
        this.graph.deleteResourceNode(node.getID());
    }
}

ResourcesExplorerEngine.prototype.processResourceEdges = function(domainEdge, mode) {
    var requests = domainEdge.getLinks(DomainEdge.Type.REQUEST);
    var referrals = domainEdge.getLinks(DomainEdge.Type.REFERRAL);
    var redirects = domainEdge.getLinks(DomainEdge.Type.REDIRECT);

    for(var i = 0; i < requests.length; i++)
        this.processResourceEdge(mode, requests[i].from, requests[i].link.url, requests[i].link, ResourceEdge.Type.REQUEST);
    for(var i = 0; i < referrals.length; i++)
        this.processResourceEdge(mode, referrals[i].from, referrals[i].link.url, referrals[i].link, ResourceEdge.Type.REFERRAL);
    for(var i = 0; i < redirects.length; i++)
        this.processResourceEdge(mode, redirects[i].from, redirects[i].link.getFinalURL(), redirects[i].link, ResourceEdge.Type.REDIRECT);
}

ResourcesExplorerEngine.prototype.processResourceEdge = function(mode, fromResourceURL, toResourceURL, linkToAdd, linkType) {
    if(mode == "create") {
        this._ensureResourceNodeExists(toResourceURL);
        this._ensureResourceNodeExists(fromResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "moveFromSource") {
        this._ensureResourceNodeExists(toResourceURL);
        this._ensureResourceEdgeNotExists(fromResourceURL, Util.getUrlHostname(toResourceURL));
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "moveToDestination") {
        this._ensureResourceNodeExists(fromResourceURL);
        this._ensureResourceEdgeNotExists(Util.getUrlHostname(fromResourceURL), toResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "addFromDomain") {
        this._ensureResourceNodeExists(toResourceURL);
        var edge = this._ensureResourceEdgeExists(Util.getUrlHostname(fromResourceURL), toResourceURL);
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
    else if(mode == "addToDomain") {
        this._ensureResourceNodeExists(fromResourceURL);
        var edge = this._ensureResourceEdgeExists(fromResourceURL, Util.getUrlHostname(toResourceURL));
        edge.addLink(fromResourceURL, linkToAdd, linkType);
    }
}

ResourcesExplorerEngine.prototype.removeResourceEdge = function(mode, edge) {
    if(mode == "delete")
        this.graph.deleteResourceEdge(edge.getID());
    else if(mode == "moveToDestination") {
        this._ensureResourceEdgeNotExists(edge.getSourceNode().getID(), edge.getDestinationNode().getID());
        var newEdge = this._ensureResourceEdgeExists(edge.getSourceNode().getID(), Util.getUrlHostname(edge.getDestinationNode().getID()));
        this.transferLinks(edge, newEdge);
    }
    else if(mode == "moveToSource") {
        this._ensureResourceEdgeNotExists(edge.getSourceNode().getID(), edge.getDestinationNode().getID());
        var newEdge = this._ensureResourceEdgeExists(Util.getUrlHostname(edge.getSourceNode().getID()), edge.getDestinationNode().getID());
        this.transferLinks(edge, newEdge);
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
    if(this.graph.existsEdge(fromNodeID, toNodeID)) this.graph.deleteResourceEdge(this.graph.getEdgeBetweenNodes(fromNodeID, toNodeID).getID());
}

ResourcesExplorerEngine.prototype.transferLinks = function(fromEdge, toEdge) {
    var requests = fromEdge.getLinks(ResourceEdge.Type.REQUEST);
    var referrals = fromEdge.getLinks(ResourceEdge.Type.REFERRAL);
    var redirects = fromEdge.getLinks(ResourceEdge.Type.REDIRECT);

    for(var i = 0; i < requests.length; i++)
        toEdge.addLink(requests[i].from, requests[i].link.url, ResourceEdge.Type.REQUEST);
    for(var i = 0; i < referrals.length; i++)
        toEdge.addLink(referrals[i].from, referrals[i].link.url, ResourceEdge.Type.REFERRAL);
    for(var i = 0; i < redirects.length; i++)
        toEdge.addLink(redirects[i].from, redirects[i].link.url, ResourceEdge.Type.REDIRECT);
}
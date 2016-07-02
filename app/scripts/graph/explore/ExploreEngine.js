"use strict";

/*  @Docs
    Manipulates the Graph, extracting domain Resources
    and edges between them
 *//*
function ExploreEngine(graph) {
    this.graph = graph;
}

ExploreEngine.prototype.expand = function(domainNode) {
    domainNode.setExpanded(true);

    var requests = domainNode.getRequests();
    for(var i = 0; i < requests.length; i++) {
        var request = requests[i];
        if(request.type == HttpRequest.Type.ROOT) {
            this._ensureNodeExists(request.url);
            var node = this.graph.getNode(request.url);
            node.addRequest(request);
        }
    }

    var inEdges = domainNode.getIncomingEdges(false);
    for(var i = 0; i < inEdges.length; i++) {
        if(inEdges[i].getSourceNode() == domainNode) {
            this.processEdges(inEdges[i], "createSameDomain");
            //this.createEdgesBetweenResources(inEdges[i]);
        }
        else if(inEdges[i].getSourceNode().isExpanded()) {
            this.processEdges(inEdges[i], "moveFromSource");
            //this.moveEdgesFromDestinationDomainToResource(inEdges[i]);
        }
        else {
            this.processEdges(inEdges[i], "createFromSource");
            //this.createEdgesBetweenDomainAndResource(inEdges[i]);
        }
    }
}

ExploreEngine.prototype.collapse = function(domainNode) {
    domainNode.setExpanded(false);
}

ExploreEngine.prototype.processEdges(domainEdge, mode) {
    var requests = domainEdge.getRequests();
    var referrals = domainEdge.getReferrals();
    var redirects = domainEdge.getRedirects();

    for(var i = 0; i < requests.length; i++) {
        if(mode == "createSameDomain") {
            this._ensureNodeExists(requests[i].from);
            this._ensureNodeExists(requests[i].request.url);
            this._ensureEdgeExists(requests[i].from, requests[i].request.url);
            var edge = this.graph.getEdgeBetweenNodes(requests[i].from, requests[i].request.url);
            edge.addRequest(requests[i]);
        }
        else if(mode == "moveFromSource") {
            var resourceEdge = this.graph.getEdgeBetweenNodes(requests[i].from, Util.getUrlHostname(requests[i].request.url));
            resourceEdge.move(resourceEdge.getSourceNode(), this.graph.getNode(requests[i].request.url));
        }
        else if(mode == "createFromSource") {

        }
    }

    for(var i = 0; i < referrals.length; i++) {
        if(mode == "createSameDomain") {
            this._ensureNodeExists(referrals[i].from);
            this._ensureNodeExists(referrals[i].request.url);
            this._ensureEdgeExists(referrals[i].from, referrals[i].request.url);
            var edge = this.graph.getEdgeBetweenNodes(referrals[i].from, referrals[i].request.url);
            edge.addReferral(referrals[i]);
        }
        else if(mode == "moveFromSource") {
            var resourceEdge = this.graph.getEdgeBetweenNodes(requests[i].from, Util.getUrlHostname(requests[i].request.url));
            resourceEdge.move(resourceEdge.getSourceNode(), this.graph.getNode(requests[i].request.url));
        }
        else if(mode == "createFromSource") {

        }
    }

    for(var i = 0; i < redirects.length; i++) {
        if(mode == "createSameDomain") {
            this._ensureNodeExists(redirects[i].getInitialURL());
            this._ensureNodeExists(redirects[i].getFinalURL());
            this._ensureEdgeExists(redirects[i].getInitialURL(), redirects[i].getFinalURL());
            var edge = this.graph.getEdgeBetweenNodes(redirects[i].getInitialURL(), redirects[i].getFinalURL());
            edge.addRedirect(redirects[i]);
        }
        else if(mode == "moveFromSource") {
            var resourceEdge = this.graph.getEdgeBetweenNodes(redirects[i].getInitialURL(), Util.getUrlHostname(redirects[i].getFinalURL())));
            resourceEdge.move(resourceEdge.getSourceNode(), this.graph.getNode(redirects[i].getFinalURL())));
        }
        else if(mode == "createFromSource") {

        }
    }
}

ExploreEngine.prototype.processEdge = function(mode, fromResourceURL, toResourceURL, linkToAdd) {
    if(mode == "createSameDomain") {
        this._ensureNodeExists(fromResourceURL);
        this._ensureNodeExists(toResourceURL);
        this._ensureEdgeExists(fromResourceURL, toResourceURL);
        var edge = this.graph.getEdgeBetweenNodes(fromResourceURL, toResourceURL);
        edge.addRedirect(linkToAdd);
    }
    else if(mode == "moveFromSource") {
        var resourceEdge = this.graph.getEdgeBetweenNodes(fromResourceURL, Util.getUrlHostname(toResourceURL));
        resourceEdge.move(resourceEdge.getSourceNode(), this.graph.getNode(toResourceURL));
    }
    else if(mode == "createFromSource") {

    }
}

ExploreEngine.prototype._ensureNodeExists = function(resourceURL) {
    if(!this.graph.existsNode(resourceURL)) this.graph.createResourceNode(resourceURL);
}

ExploreEngine.prototype._ensureEdgeExists = function(fromResourceUrl, toResourceUrl) {
    if(!this.graph.existsEdge(fromResourceUrl, toResourceUrl)) this.graph.createResourceEdge(fromResourceUrl, toResourceUrl);
}
*/
"use strict";

function DomainEdge(id, fromNode, toNode, graph) {
    Edge.call(this, id, fromNode, toNode, graph);

    this._links = {};
    for(var key in DomainEdge.LinkType) {
        var type = DomainEdge.LinkType[key];
        this._links[type.name] = [];
    }
    this.type = DomainEdge.Type.NON_REFERRING;

    this.createVisualEdge();

    this.detached = false;      //used to detect detached edges from graph (belonging to clustered nodes)
}

DomainEdge.prototype = Object.create(Edge.prototype);
DomainEdge.prototype.constructor = DomainEdge;

DomainEdge.Type = {
    NON_REFERRING: {
        name: "Non Referring",
        color: {
            domain: "grey",
            resource: "#77773c"
        },
        rank: 2
    },
    REFERRING: {
        name: "Referring",
        color: {
            domain: "red",
            resource: "#FF8000"
        },
        rank: 1
    }
}

DomainEdge.LinkType = {
    REQUEST: {name: "Request"},
    REDIRECT: {name: "Redirect"},
    REFERRAL: {name: "Referral"}
}

DomainEdge.prototype.addLink = function(fromURL, link, linkType) {
    if(linkType == DomainEdge.LinkType.REFERRAL && this.type == DomainEdge.Type.NON_REFERRING) this.updateType(DomainEdge.Type.REFERRING);
    this.updateStyle(linkType);

    this._links[linkType.name].push({from: fromURL, link: link});
}

DomainEdge.prototype.getLinks = function(linkType) {
    if(linkType === undefined) return this._links;
    return this._links[linkType.name];
}

DomainEdge.prototype.getType = function() {
    return this.type;
}

DomainEdge.prototype.createVisualEdge = function(){
    var options = {
        arrows: {
            to: {scaleFactor: 1}
        },
        width: 3,
        color: this.type.color.domain
    };
    Edge.prototype.createVisualEdge.call(this, options);
}

DomainEdge.prototype.updateVisualEdgeType = function() {
    var options = {
        color: this.type.color.domain
    };
    Edge.prototype.updateVisualEdge.call(this, options);
}

DomainEdge.prototype.updateType = function(type) {
    var previousType = this.type, newType = type;

    this.type = newType;
    this.updateVisualEdgeType();

    this.notifyForChange(previousType, newType);
}

DomainEdge.prototype.updateStyle = function(addedLinkType) {
    if( (this.getLinks(DomainEdge.LinkType.REQUEST).length == 0) && (this.getLinks(DomainEdge.LinkType.REDIRECT).length == 0) ) { //edge will now include only requests or only redirects
        if(addedLinkType == DomainEdge.LinkType.REQUEST) Edge.prototype.updateVisualEdge.call(this, {dashes: false});
        else if(addedLinkType == DomainEdge.LinkType.REDIRECT) Edge.prototype.updateVisualEdge.call(this, {dashes: [1,10]}); //dotted
    }
    else if( ((this.getLinks(DomainEdge.LinkType.REDIRECT).length == 0) && (addedLinkType == DomainEdge.LinkType.REDIRECT)) ||
        ((this.getLinks(DomainEdge.LinkType.REQUEST).length == 0) && (addedLinkType == DomainEdge.LinkType.REQUEST)) ) {    //edge will now include both requests and redirects
        Edge.prototype.updateVisualEdge.call(this, {dashes: [10,10]}); //dashed
    }
}

DomainEdge.groupEdgesByType = function(edges) {
    var groupedEdges = {};
    for(var key in DomainEdge.Type) {
        var type = DomainEdge.Type[key];
        groupedEdges[type.name] = [];
    }
    for(var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        groupedEdges[edge.getType().name].push(edge);
    }
    return groupedEdges;
}

DomainEdge.prototype.getLinksFromEdge = function(originalEdge) {
    for(var key in DomainEdge.LinkType) {
        var links = originalEdge.getLinks(DomainEdge.LinkType[key]);
        for(var i = 0; i < links.length; i++) this.addLink(links[i].from, links[i].link, DomainEdge.LinkType[key]);
    }
}

DomainEdge.prototype.isDetached = function() {
    return this.detached;
}

DomainEdge.prototype.setDetached = function(detached) {
    if(detached == true) this.hide();
    else this.checkAndShow();

    this.detached = detached;
}
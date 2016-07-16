"use strict";

function DomainNode(id, graph, networkNodes) {
    Node.call(this, id, graph, networkNodes);

    this.type = DomainNode.Type.default;
    this.cookies = {};
    this.cookies[HttpRequest.Type.ROOT] = {};
    this.cookies[HttpRequest.Type.EMBEDDED] = {};
    this._requests = [];
    this._expanded = false;

    this._children = {};

    this.createVisualNode();
}

DomainNode.prototype = Object.create(Node.prototype);

DomainNode.Type = {};
DomainNode.Type["default"] = {name: "Default", rank: 3, size: 20};
DomainNode.Type[HttpRequest.Type.ROOT] = {name: "First Party", rank: 1, size: 40};
DomainNode.Type[HttpRequest.Type.EMBEDDED] = {name: "Third Party", rank: 2, size: 20};

DomainNode.prototype.setExpanded = function(isExpanded) {
    this._expanded = isExpanded;
}

DomainNode.prototype.isExpanded = function() {
    return this._expanded;
}

DomainNode.prototype.addRequest = function(httpRequest) {
    this._requests.push(httpRequest);
    for(var key in httpRequest.cookies) {
        this.cookies[httpRequest.type][key] = httpRequest.cookies[key];
    }
    if(this.type.rank > DomainNode.Type[httpRequest.type].rank) this.updateType(DomainNode.Type[httpRequest.type]);
}

DomainNode.prototype.getRequests = function() {
    return this._requests;
}

DomainNode.prototype.getFirstPartyCookies = function() {
    return this.cookies[HttpRequest.Type.ROOT];
}

DomainNode.prototype.getThirdPartyCookies = function() {
    return this.cookies[HttpRequest.Type.EMBEDDED];
}

DomainNode.getFaviconURL = function(domain) {
    return "http://www.google.com/s2/favicons?domain=" + domain;
}

DomainNode.prototype.getDomain = function() {
    return this.getID();
}

DomainNode.prototype.createVisualNode = function() {
    var options = {
        shape: 'circularImage',
        size: this.type.size,
        image: DomainNode.getFaviconURL(this.getID()),
        borderWidth: 5,
        title: this.getID()
    }
    Node.prototype.createVisualNode.call(this, options);
}

DomainNode.prototype.updateVisualNodeType = function() {
    var updateOptions = {
        size: this.type.size
    }
    Node.prototype.updateVisualNodeType.call(this, updateOptions);
}

DomainNode.prototype.updateType = function(type) {
    var previousType = this.type, newType = type;

    this.type = newType;
    this.updateVisualNodeType();

    this.notifyForChange(previousType, newType);
}

DomainNode.prototype.addChildNode = function(resourceNode) {
    this._children[resourceNode.getID()] = resourceNode;
}

DomainNode.prototype.getChildrenNodes = function() {
    var children = [];
    for(var key in this._children)
        children.push(this._children[key]);
    return children;
}

DomainNode.prototype.removeChildNode = function(id) {
    delete this._children[id];
}

DomainNode.prototype.getIncomingDomainEdges = function(excludeSelfReferencing) {
    var filterDomainEdges = function(edge) {return (edge.constructor == DomainEdge);};
    return this.getIncomingEdges(excludeSelfReferencing).filter(filterDomainEdges);
}

DomainNode.prototype.getIncomingResourceEdges = function(excludeSelfReferencing) {
    var filterResourceEdges = function(edge) {return (edge.constructor == ResourceEdge);};
    return this.getIncomingEdges(excludeSelfReferencing).filter(filterResourceEdges);
}

DomainNode.prototype.getOutgoingDomainEdges = function(excludeSelfReferencing) {
    var filterDomainEdges = function(edge) {return (edge.constructor == DomainEdge);};
    return this.getOutgoingEdges(excludeSelfReferencing).filter(filterDomainEdges);
}

DomainNode.prototype.getOutgoingResourceEdges = function(excludeSelfReferencing) {
    var filterResourceEdges = function(edge) {return (edge.constructor == ResourceEdge);};
    return this.getOutgoingEdges(excludeSelfReferencing).filter(filterResourceEdges);
}

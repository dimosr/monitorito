"use strict";

function DomainNode(id, graph, networkNodes) {
    Node.call(this, id, graph, networkNodes);

    this.type = DomainNode.Type.default;
    this.cookies = {};
    this.cookies[HttpRequest.Type.ROOT] = {};
    this.cookies[HttpRequest.Type.EMBEDDED] = {};
    this._requests = [];

    this.createVisualNode();
}

DomainNode.prototype = Object.create(Node.prototype);

DomainNode.Type = {};
DomainNode.Type["default"] = {name: "Default", rank: 3, size: 20};
DomainNode.Type[HttpRequest.Type.ROOT] = {name: "First Party", rank: 1, size: 40};
DomainNode.Type[HttpRequest.Type.EMBEDDED] = {name: "Third Party", rank: 2, size: 20};

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
        id: this.getID(),
        shape: 'circularImage',
        size: this.type.size,
        image: DomainNode.getFaviconURL(this.getID()),
        borderWidth: 5,
        'color.border': '#04000F',
        'color.highlight.border': '#CCC6E2',
        title: this.getID()
    }
    Node.prototype.createVisualNode.call(this, options);
}

DomainNode.prototype.updateVisualNodeType = function() {
    var updateOptions = {
        id: this.getID(),
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
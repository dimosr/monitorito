function Edge(ID, type, fromNode, toNode) {
	this.type = type;
	this.from = fromNode;
	this.to = toNode;
	this.links = [];

	this.vizEdge = Edge.buildVizEdge(ID, type, fromNode, toNode);
}

Edge.Type = {
	REQUEST: {name: "Request", dashes: false},
	REDIRECT: {name: "Redirect", dashes: true},
}

Edge.prototype.addRequest = function(fromURL, toURL) {
	this.links.push({from: fromURL, to: toURL});
}

Edge.buildVizEdge = function(ID, type, fromNode, toNode){
	return {
		id: ID,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNode.getID(),
		to: toNode.getID(),
		width: 3,
		dashes: type.dashes
	}
}
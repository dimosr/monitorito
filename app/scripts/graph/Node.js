function Node(ID, type, domain) {
	this.type = type;
	this.requests = [];
	this.adjacent = {};

	this.vizNode = Node.buildVizNode(ID, type, domain);
}

Node.Type = {
	ROOT: {size: 40},
	INTERMEDIATE: {size: 30},
	EMBEDDED: {size: 20}
}

Node.prototype.getID = function() {
	return this.vizNode.id;
}

Node.prototype.getDomain = function() {
	return this.vizNode.title;
}

Node.prototype.addRequest = function(HttpRequest) {
	this.requests.push(HttpRequest);
}

Node.prototype.addAdjacentNode = function(adjNode, edge) {
	this.adjacent[adjNode.getDomain()] = {'edge': edge};
}

Node.prototype.getEdgeWithAdjacent = function(adjNode) {
	return this.adjacent[adjNode.getDomain()].edge;
}

Node.buildVizNode = function(ID, type, domain) {
	return {
		id: ID, 
		shape: 'circularImage', 
		size: type.size, 
		image: Node.getFaviconURL(domain),
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: domain
	}
}

Node.getFaviconURL = function(domain) {
	return "http://www.google.com/s2/favicons?domain=" + domain;
}
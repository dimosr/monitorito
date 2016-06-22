QUnit.module( "graph.Node", {
	beforeEach: function() {
		var visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
		var graph = new Graph(visualisationNetwork);
		this.mockGraph = sinon.mock(graph);

		this.fromNode = new Node("www.example.com", graph, visualisationNetwork.getNodesDataset());
		this.toNode = new Node("www.dependency.com", graph, visualisationNetwork.getNodesDataset());

		this.edge = new Edge(1, this.fromNode, this.toNode, graph, visualisationNetwork.getNodesDataset());
	}
});

QUnit.test("getters and translation of type to node size", function(assert) {
	var fromNode = this.fromNode;
	var toNode = this.toNode;

	assert.equal(fromNode.getID(), "www.example.com", "node.getID() returns correctly the assigned id");
	assert.equal(fromNode.type, Node.Type.default, "node.getID() returns correctly the assigned id");
});

QUnit.test("addRequest() method", function(assert) {
	var fromNode = this.fromNode;
	var request = new HttpRequest("POST", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	fromNode.addRequest(request);

	assert.equal(fromNode.getRequests().length, 1, "only the added request is returned");
	assert.ok(fromNode.getRequests().indexOf(request) != -1, "added request is included in the returned requests");
});

QUnit.test("addEdgeTo(), getEdgeTo() and hasEdgeTo() methods", function(assert) {
	var fromNode = this.fromNode;
	var toNode = this.toNode;
	var edge = this.edge;

	assert.equal(fromNode.getEdgeTo(toNode), edge, "added edge is successfully returned by getEdgeTo()");
	assert.ok(fromNode.hasEdgeTo(toNode), "fromNode has edge to toNode");
	assert.notOk(toNode.hasEdgeTo(fromNode), "toNode does not have edge to fromNode");
});

QUnit.test("addEdgeFrom(), getEdgeFrom() and hasEdgeFrom() methods", function(assert) {
	var fromNode = this.fromNode;
	var toNode = this.toNode;
	var edge = this.edge;

	assert.equal(toNode.getEdgeFrom(fromNode), edge, "added edge is successfully returned by getEdgeFrom()");
	assert.ok(toNode.hasEdgeFrom(fromNode), "toNode has edge from fromNode");
	assert.notOk(fromNode.hasEdgeFrom(toNode), "fromNode does not have edge from toNode");
});

QUnit.test("getOutgoingEdges(), getIncomingEdges() methods", function(assert) {
	var fromNode = this.fromNode;
	var toNode = this.toNode;
	var edge = this.edge;

	assert.equal(fromNode.getOutgoingEdges().length, 1, "fromNode has only 1 outgoin edge");
	assert.ok(fromNode.getOutgoingEdges().indexOf(edge) != -1, "the added edge is returned by getOutgoingEdges");
	assert.equal(toNode.getIncomingEdges().length, 1, "to has only 1 incoming edge");
	assert.ok(toNode.getIncomingEdges().indexOf(edge) != -1, "the added edge in returned by getIncomingEdges");
});
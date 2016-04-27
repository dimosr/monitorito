QUnit.module( "graph.statistics.GraphStatsCalculator", {
	beforeEach: function() {
		this.graphStatsCalculator = new GraphStatsCalculator();
	}
});

QUnit.test("validate calculations of statistics", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	var fromNode = new Node(1, HttpRequest.Type.ROOT, "www.example.com");
	var toNode = new Node(2, HttpRequest.Type.EMBEDDED, "www.dependency.com");
	var otherNode = new Node(2, HttpRequest.Type.EMBEDDED, "www.other.com");
	var edge = new Edge(1, Edge.Type.REQUEST, fromNode, toNode);
	fromNode.addEdgeTo(toNode, edge);
	toNode.addEdgeFrom(fromNode, edge);

	toNode.addEdgeTo(fromNode, edge);
	fromNode.addEdgeFrom(toNode, edge);

	graphStatsCalculator.onNewNode(fromNode);
	assert.equal(graphStatsCalculator.rootNodes, 1, "added root node is counted");
	assert.equal(graphStatsCalculator.embeddedNodes, 0, "no embedded node has been added");
	assert.equal(graphStatsCalculator.minOutgoingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.minIncomingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.maxOutgoingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.maxIncomingEdges, 0, "no edge has been added");

	graphStatsCalculator.onNewNode(toNode);
	assert.equal(graphStatsCalculator.rootNodes, 1, "no root node has been added");
	assert.equal(graphStatsCalculator.embeddedNodes, 1, "added embedded node is counted");
	assert.equal(graphStatsCalculator.minOutgoingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.minIncomingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.maxOutgoingEdges, 0, "no edge has been added");
	assert.equal(graphStatsCalculator.maxIncomingEdges, 0, "no edge has been added");

	graphStatsCalculator.onNewEdge(fromNode, toNode, edge);
	graphStatsCalculator.onNewEdge(toNode, fromNode, edge);
	graphStatsCalculator.onNewNode(otherNode);
	assert.equal(graphStatsCalculator.rootNodes, 1, "no root node has been added");
	assert.equal(graphStatsCalculator.embeddedNodes, 2, "added embedded node is counted");
	assert.equal(graphStatsCalculator.minOutgoingEdges, 0, "other node has zero outgoing edges");
	assert.equal(graphStatsCalculator.minIncomingEdges, 0, "other node has zero incoming edges");
	assert.equal(graphStatsCalculator.maxOutgoingEdges, 1, "fromNode has 1 outgoing edge");
	assert.equal(graphStatsCalculator.maxIncomingEdges, 1, "toNode has 1 incoming edge");
});
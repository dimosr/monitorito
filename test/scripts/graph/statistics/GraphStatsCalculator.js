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
	var statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.root, 1, "added root node is counted");
	assert.equal(statistics.nodeTypes.embedded, 0, "no embedded node has been added");
	assert.equal(statistics.outEdges.min, 0, "no edge has been added");
	assert.equal(statistics.inEdges.min, 0, "no edge has been added");
	assert.equal(statistics.outEdges.max, 0, "no edge has been added");
	assert.equal(statistics.inEdges.max, 0, "no edge has been added");

	graphStatsCalculator.onNewNode(toNode);
	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.root, 1, "no root node has been added");
	assert.equal(statistics.nodeTypes.embedded, 1, "added embedded node is counted");
	assert.equal(statistics.outEdges.min, 0, "no edge has been added");
	assert.equal(statistics.inEdges.min, 0, "no edge has been added");
	assert.equal(statistics.outEdges.max, 0, "no edge has been added");
	assert.equal(statistics.inEdges.max, 0, "no edge has been added");

	graphStatsCalculator.onNewEdge(fromNode, toNode, edge);
	graphStatsCalculator.onNewEdge(toNode, fromNode, edge);
	graphStatsCalculator.onNewNode(otherNode);
	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.root, 1, "no root node has been added");
	assert.equal(statistics.nodeTypes.embedded, 2, "added embedded node is counted");
	assert.equal(statistics.outEdges.min, 0, "other node has zero outgoing edges");
	assert.equal(statistics.inEdges.min, 0, "other node has zero incoming edges");
	assert.equal(statistics.outEdges.max, 1, "fromNode has 1 outgoing edge");
	assert.equal(statistics.inEdges.max, 1, "toNode has 1 incoming edge");
});
QUnit.module( "graph.statistics.GraphStatsCalculator", {
	beforeEach: function() {
		this.graphStatsCalculator = new GraphStatsCalculator();
	}
});

QUnit.test("validate calculations of nodeTypes, in & out edges max,min", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	/* 
		Test Graph Structure
		fromNode <----> toNode     otherNode
	*/
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

QUnit.test("validate calculations of average & Standard deviation", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	/* 
		Test Graph Structure
		 	 /-->2--\
		5-->1		4
		 	 \-->3
	*/
	var node1 = new Node(1, HttpRequest.Type.ROOT, "www.example.com");
	var node2 = new Node(2, HttpRequest.Type.EMBEDDED, "www.example.com/2");
	var node3 = new Node(3, HttpRequest.Type.EMBEDDED, "www.example.com/3");
	var node4 = new Node(4, HttpRequest.Type.EMBEDDED, "www.example.com/4");
	var node5 = new Node(5, HttpRequest.Type.ROOT, "www.sub.example.com");

	var edge1 = new Edge(1, Edge.Type.REQUEST, node5, node1);
	node5.addEdgeTo(node1, edge1);
	node1.addEdgeFrom(node5, edge1);
	graphStatsCalculator.onNewNode(node5);
	graphStatsCalculator.onNewNode(node1);
	graphStatsCalculator.onNewEdge(node5, node1, edge1);

	var edge2 = new Edge(2, Edge.Type.REQUEST, node1, node2);
	node1.addEdgeTo(node2, edge2);
	node2.addEdgeFrom(node1, edge2);
	graphStatsCalculator.onNewNode(node2);
	graphStatsCalculator.onNewEdge(node1, node2, edge2);

	var edge3 = new Edge(3, Edge.Type.REQUEST, node1, node3);
	node1.addEdgeTo(node3, edge3);
	node3.addEdgeFrom(node1, edge3);
	graphStatsCalculator.onNewNode(node3);
	graphStatsCalculator.onNewEdge(node1, node3, edge3);

	var edge4 = new Edge(4, Edge.Type.REQUEST, node2, node4);
	node2.addEdgeTo(node4, edge4);
	node4.addEdgeFrom(node2, edge4);
	graphStatsCalculator.onNewNode(node4);
	graphStatsCalculator.onNewEdge(node2, node4, edge4);

	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.inEdges.avg, 0.8, "Average of incoming edges calculated correctly");
	assert.equal(statistics.outEdges.avg, 0.8, "Average of outgoing edges calculated correctly");
	assert.ok(Math.abs(statistics.inEdges.stdDev - 0.4) < 0.001, "Standard deviation of incoming Edges calculated with good precision");
	assert.ok(Math.abs(statistics.outEdges.stdDev - 0.7483) < 0.001, "Standard deviation of outgoing Edges calculated with good precision");
});

QUnit.test("rounding", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	assert.equal(graphStatsCalculator.roundDecimal(3.4566), 3.457, "Floating point number rounded to 3 decimal points correctly");
	assert.equal(graphStatsCalculator.roundDecimal(3), 3, "Rounding for integers works correctly");
	assert.equal(graphStatsCalculator.roundDecimal(3.1), 3.1, "Rounding for floats with few decimal points works correctly");
});
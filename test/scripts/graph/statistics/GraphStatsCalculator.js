QUnit.module( "graph.statistics.GraphStatsCalculator", {
	beforeEach: function() {
		this.graphStatsCalculator = new GraphStatsCalculator();

		this.graph = new Graph(null);
	}
});

QUnit.test("validate calculations of nodeTypes, in & out edges max,min", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	/* 
		Test Graph Structure
		fromNode ----> toNode     otherNode
	*/
	var fromNode = new Node("www.example.com", this.graph, null);
	var toNode = new Node("www.dependency.com", this.graph, null);
	var otherNode = new Node("www.other.com", this.graph, null);
	var edge = new Edge(1, fromNode, toNode, this.graph, null);

	graphStatsCalculator.onNewNode(fromNode);
	graphStatsCalculator.onNodeChange(Node.Type.default, Node.Type[HttpRequest.Type.ROOT], fromNode);
	var statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.firstParty, 1, "added root node is counted");
	assert.equal(statistics.nodeTypes.thirdParty, 0, "no embedded node has been added");
	assert.equal(statistics.outEdges.nonReferral.min, 0, "no edge has been added");
	assert.equal(statistics.inEdges.nonReferral.min, 0, "no edge has been added");
	assert.equal(statistics.outEdges.nonReferral.max, 0, "no edge has been added");
	assert.equal(statistics.inEdges.nonReferral.max, 0, "no edge has been added");

	graphStatsCalculator.onNewNode(toNode);
	graphStatsCalculator.onNodeChange(Node.Type.default, Node.Type[HttpRequest.Type.EMBEDDED], toNode);
	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.firstParty, 1, "no root node has been added");
	assert.equal(statistics.nodeTypes.thirdParty, 1, "added embedded node is counted");
	assert.equal(statistics.outEdges.nonReferral.min, 0, "no edge has been added");
	assert.equal(statistics.inEdges.nonReferral.min, 0, "no edge has been added");
	assert.equal(statistics.outEdges.nonReferral.max, 0, "no edge has been added");
	assert.equal(statistics.inEdges.nonReferral.max, 0, "no edge has been added");

	graphStatsCalculator.onNewEdge(edge);
	graphStatsCalculator.onNewNode(otherNode);
	graphStatsCalculator.onNodeChange(Node.Type.default, Node.Type[HttpRequest.Type.EMBEDDED], otherNode);
	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.nodeTypes.firstParty, 1, "no root node has been added");
	assert.equal(statistics.nodeTypes.thirdParty, 2, "added embedded node is counted");
	assert.equal(statistics.outEdges.nonReferral.min, 0, "other node has zero outgoing edges");
	assert.equal(statistics.inEdges.nonReferral.min, 0, "other node has zero incoming edges");
	assert.equal(statistics.outEdges.nonReferral.max, 1, "fromNode has 1 outgoing edge");
	assert.equal(statistics.inEdges.nonReferral.max, 1, "toNode has 1 incoming edge");
});

QUnit.test("validate calculations of average & Standard deviation", function(assert) {
	var graphStatsCalculator = this.graphStatsCalculator;

	/* 
		Test Graph Structure
		 	 /-->2--\
		5-->1		4
		 	 \-->3
	*/
	var node1 = new Node("www.example1.com", this.graph, null);
	var node2 = new Node("www.example2.com", this.graph, null);
	var node3 = new Node("www.example3.com", this.graph, null);
	var node4 = new Node("www.example4.com", this.graph, null);
	var node5 = new Node("www.sub.example.com", this.graph, null);

	var edge1 = new Edge(1, node5, node1, this.graph, null);
	graphStatsCalculator.onNewNode(node5);
	graphStatsCalculator.onNewNode(node1);
	graphStatsCalculator.onNewEdge(edge1);

	var edge2 = new Edge(2, node1, node2, this.graph, null);
	graphStatsCalculator.onNewNode(node2);
	graphStatsCalculator.onNewEdge(edge2);

	var edge3 = new Edge(3, node1, node3, this.graph, null);
	graphStatsCalculator.onNewNode(node3);
	graphStatsCalculator.onNewEdge(edge3);

	var edge4 = new Edge(4, node2, node4, this.graph, null);
	graphStatsCalculator.onNewNode(node4);
	graphStatsCalculator.onNewEdge(edge4);

	statistics = graphStatsCalculator.getStatistics();
	assert.equal(statistics.inEdges.nonReferral.avg, 0.8, "Average of incoming edges calculated correctly");
	assert.equal(statistics.outEdges.nonReferral.avg, 0.8, "Average of outgoing edges calculated correctly");
	assert.ok(Math.abs(statistics.inEdges.nonReferral.stdDev - 0.4) < 0.001, "Standard deviation of incoming Edges calculated with good precision");
	assert.ok(Math.abs(statistics.outEdges.nonReferral.stdDev - 0.7483) < 0.001, "Standard deviation of outgoing Edges calculated with good precision");
});
QUnit.module( "graph.Graph", {
	/* Testing Graph with-without visualisation enabled
	   Stubbed visualisation network is used when enabled*/
	beforeEach: function() {
		this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
		this.graph = new Graph(this.visualisationNetwork);

		this.mockNetwork = sinon.mock(this.visualisationNetwork);
	}
});

QUnit.test("createEdge(), existsEdge(), addRequestToEdge() methods", function(assert){
	var graph = this.graph;
	graph.createNode("www.example.com");
	graph.createNode("www.dependency.com");
	graph.createEdge("www.example.com", "www.dependency.com", Edge.Type.REQUEST);

	assert.ok(graph.existsEdge("www.example.com", "www.dependency.com"), "Added edge exists in the graph");
	assert.equal(graph.getEdgeBetweenNodes("www.example.com", "www.dependency.com").getType(), Edge.Type.DEFAULT, "Initial edge type is default");

	graph.addRequestToEdge("http://www.example.com/test", "http://www.dependency.com/library");
	request = graph.getEdgeBetweenNodes("www.example.com", "www.dependency.com").getRequests()[0];
	assert.equal(request.from, "http://www.example.com/test", "from URL of request set successfully");
	assert.equal(request.to, "http://www.dependency.com/library", "to URL of request set succesfully");
});

QUnit.test("createNode(), existsNode(), addRequestToNode() methods", function(assert) {
	var graph = this.graph;
	graph.createNode("www.example.com");

	assert.ok(graph.existsNode("www.example.com"), "Added node exists in the graph");

	var request = new HttpRequest("POST", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	graph.addRequestToNode(request);
	assert.ok(graph.getNode("www.example.com").getRequests().indexOf(request) != -1, "Added request exists in node");
});

QUnit.test("notifyForNewNode(), notifyForNewEdge() methods", function(assert) {
	var graphStatsCalculator = new GraphStatsCalculator();
	var mockGraphStatsCalculator = sinon.mock(graphStatsCalculator);
	var graph = this.graph;

	graph.register(graphStatsCalculator);

	var srcNode = sinon.createStubInstance(Node);
	var edge = sinon.createStubInstance(Edge);

	mockGraphStatsCalculator.expects("onNewNode").exactly(1).withArgs(srcNode);
	mockGraphStatsCalculator.expects("onNodeChange").exactly(1).withArgs(Node.Type.default, Node.Type[HttpRequest.Type.ROOT], srcNode);
	mockGraphStatsCalculator.expects("onNewEdge").exactly(1).withArgs( edge);
	mockGraphStatsCalculator.expects("onEdgeChange").exactly(1).withArgs(Edge.Type.DEFAULT, Edge.Type.REQUEST, edge);

	graph.notifyForNewNode(srcNode);
	graph.notifyForNodeChange(Node.Type.default, Node.Type[HttpRequest.Type.ROOT], srcNode);
	graph.notifyForNewEdge(edge);
	graph.notifyForEdgeChange(Edge.Type.DEFAULT, Edge.Type.REQUEST, edge);

	mockGraphStatsCalculator.verify();
});

QUnit.test("disablePhysics(), enablePhysics() methods", function(assert) {
	var graph = this.graph;
	var mockNetwork = this.mockNetwork;

	mockNetwork.expects("enablePhysics").exactly(1);
	mockNetwork.expects("disablePhysics").exactly(1);

	graph.enablePhysics();
	graph.disablePhysics();

	mockNetwork.verify();
});
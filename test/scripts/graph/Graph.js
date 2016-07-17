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
	graph.createDomainNode("www.example.com");
	graph.createDomainNode("www.dependency.com");
	graph.createDomainEdge("www.example.com", "www.dependency.com");

	assert.ok(graph.existsEdge("www.example.com", "www.dependency.com"), "Added edge exists in the graph");
	assert.equal(graph.getEdgeBetweenNodes("www.example.com", "www.dependency.com").getType(), DomainEdge.Type.NON_REFERRING, "Initial edge type is non referring");
});

QUnit.test("createNode(), existsNode(), addRequestToNode() methods", function(assert) {
	var graph = this.graph;
	graph.createDomainNode("www.example.com");

	assert.ok(graph.existsNode("www.example.com"), "Added node exists in the graph");
});

QUnit.test("deleteNode() on ResourceNode removes succesfully all references from parent node", function(assert) {
	var graph = this.graph;
	graph.createDomainNode("www.example.com");
	graph.createResourceNode("http://www.example.com");
	assert.ok(graph.getNode("www.example.com").getChildrenNodes().length == 1, "Resource node included");

	graph.deleteNode("http://www.example.com");
	assert.ok(graph.getNode("www.example.com").getChildrenNodes().length == 0, "Resource node not included");
});

QUnit.test("notifyForNewNode(), notifyForNewEdge() methods", function(assert) {
	var graphStatsCalculator = new GraphStatsCalculator();
	var mockGraphStatsCalculator = sinon.mock(graphStatsCalculator);
	var graph = this.graph;

	graph.register(graphStatsCalculator);

	var srcNode = sinon.createStubInstance(DomainNode);
	var edge = sinon.createStubInstance(DomainEdge);

	mockGraphStatsCalculator.expects("onNewNode").exactly(1).withArgs(srcNode);
	mockGraphStatsCalculator.expects("onNodeChange").exactly(1).withArgs(DomainNode.Type.default, DomainNode.Type[HttpRequest.Type.ROOT], srcNode);
	mockGraphStatsCalculator.expects("onNewEdge").exactly(1).withArgs( edge);
	mockGraphStatsCalculator.expects("onEdgeChange").exactly(1).withArgs(DomainEdge.Type.NON_REFERRING, DomainEdge.Type.REFERRING, edge);

	graph.notifyForNewNode(srcNode);
	graph.notifyForNodeChange(DomainNode.Type.default, DomainNode.Type[HttpRequest.Type.ROOT], srcNode);
	graph.notifyForNewEdge(edge);
	graph.notifyForEdgeChange(DomainEdge.Type.NON_REFERRING, DomainEdge.Type.REFERRING, edge);

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
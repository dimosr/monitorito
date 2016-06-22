QUnit.module( "graph.Edge", {
	beforeEach: function() {
		var visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);

		var graph = new Graph(visualisationNetwork);
		this.mockGraph = sinon.mock(graph);

		this.fromNode = new Node("www.example.com", graph, visualisationNetwork.getNodesDataset());
		this.toNode = new Node("www.dependency.com", graph, visualisationNetwork.getNodesDataset());

		this.edge = new Edge(1, this.fromNode, this.toNode, graph, visualisationNetwork.getEdgesDataset());

		var redirectToNode = new Node( "www.example2.com", graph, visualisationNetwork.getNodesDataset());
		this.edge2 = new Edge(2, this.fromNode, redirectToNode, graph, visualisationNetwork.getEdgesDataset());
	}
});

QUnit.test("getters", function(assert) {
	var edge = this.edge;
	var fromNode = this.fromNode;
	var toNode = this.toNode;

	assert.equal(edge.getSourceNode(), fromNode, "getSourceNode() working");
	assert.equal(edge.getDestinationNode(), toNode, "getDestinationNode() working");
});

QUnit.test("addRequest() to edge method", function(assert) {
	var edge = this.edge;
	edge.addRequest("http://www.example.com/index", "http://www.dependency.com/library");

	var requests = edge.getRequests();
	assert.equal(requests[0].from, "http://www.example.com/index", "from Url of link added correctly");
	assert.equal(requests[0].to, "http://www.dependency.com/library", "to Url of link added correctly");
});

QUnit.test("Edge type updated, depending on added links", function(assert) {
	var edge = this.edge;

	edge.addReferral("www.example.com/resource1", "www.dependency.com/resource2");
	assert.equal(edge.getType(), Edge.Type.REFERRAL, "Edge type converted to REFERRAL");
});
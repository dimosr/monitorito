QUnit.module( "graph.Edge", {
	beforeEach: function() {
		var visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);

		var graph = new Graph(visualisationNetwork);
		this.mockGraph = sinon.mock(graph);

		this.fromNode = new DomainNode("www.example.com", graph, visualisationNetwork.getNodesDataset());
		this.toNode = new DomainNode("www.dependency.com", graph, visualisationNetwork.getNodesDataset());

		this.edge = new DomainEdge(1, this.fromNode, this.toNode, graph, visualisationNetwork.getEdgesDataset());

		var redirectToNode = new DomainNode( "www.example2.com", graph, visualisationNetwork.getNodesDataset());
		this.edge2 = new DomainEdge(2, this.fromNode, redirectToNode, graph, visualisationNetwork.getEdgesDataset());
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
	var request = new HttpRequest(1, "GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
	edge.addRequest("http://www.example.com/index", request);

	var requests = edge.getRequests();
	assert.equal(requests[0].from, "http://www.example.com/index", "from Url of link added correctly");
	assert.equal(requests[0].request, request, "Request of link added correctly");
});

QUnit.test("Edge type updated, depending on added links", function(assert) {
	var edge = this.edge;

	var request = new HttpRequest(1, "GET",  "www.dependency.com/resource2", Date.now(), {}, HttpRequest.Type.EMBEDDED, "sub_frame");
	edge.addReferral("www.example.com/resource1", request);
	assert.equal(edge.getType(), DomainEdge.Type.REFERRAL, "Edge type converted to REFERRAL");
});
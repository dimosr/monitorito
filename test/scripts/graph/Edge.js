QUnit.module( "graph.Edge", {
	beforeEach: function() {
		this.fromNode = new Node(1, HttpRequest.ROOT, "www.example.com");
		this.toNode = new Node(2, HttpRequest.EMBEDDED, "www.dependency.com");

		this.edge = new Edge(1, Edge.Type.REQUEST, this.fromNode, this.toNode);

		var redirectToNode = new Node(3, HttpRequest.ROOT, "www.example2.com");
		this.edge2 = new Edge(2, Edge.Type.REDIRECT, this.fromNode, redirectToNode);
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

QUnit.test("Contructor of Edge transforms Edge.Type to style", function(assert) {
	var requestEdge = this.edge;
	var redirectEdge = this.edge2;

	assert.equal(requestEdge.getVizEdge().dashes, requestEdge.getType().dashes, "vizEdge's style of requestEdge correctly translated");
	assert.equal(redirectEdge.getVizEdge().dashes, redirectEdge.getType().dashes, "vizEdge's style of redirectEdge correctly translated");
});
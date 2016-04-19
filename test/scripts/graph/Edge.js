QUnit.module( "graph.Edge", {
	beforeEach: function() {
		var fromNode = new Node(1, HttpRequest.ROOT, "www.example.com");
		var toNode = new Node(2, HttpRequest.EMBEDDED, "www.dependency.com");

		this.edge = new Edge(1, Edge.Type.REQUEST, fromNode, toNode);

		var redirectToNode = new Node(3, HttpRequest.ROOT, "www.example2.com");
		this.edge2 = new Edge(2, Edge.Type.REDIRECT, fromNode, redirectToNode);
	}
});

QUnit.test("addRequest() to edge method", function(assert) {
	var edge = this.edge;
	edge.addRequest("http://www.example.com/index", "http://www.dependency.com/library");

	var edgeLinks = edge.links;
	assert.equal(edgeLinks[0].from, "http://www.example.com/index", "from Url of link added correctly");
	assert.equal(edgeLinks[0].to, "http://www.dependency.com/library", "to Url of link added correctly");
});

QUnit.test("Contructor of Edge transforms Edge.Type to style", function(assert) {
	var requestEdge = this.edge;
	var redirectEdge = this.edge2;

	assert.equal(requestEdge.vizEdge.dashes, requestEdge.type.dashes, "vizEdge's style of requestEdge correctly translated");
	assert.equal(redirectEdge.vizEdge.dashes, redirectEdge.type.dashes, "vizEdge's style of redirectEdge correctly translated");
});
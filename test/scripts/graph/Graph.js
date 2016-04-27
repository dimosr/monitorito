QUnit.module( "graph.Graph", {
	beforeEach: function() {
		eventHandlers = {};
		this.visNetwork = {
			body: {
				data: {
					edges: {add: function(){}},
					nodes: {add: function(){}},
				}
			},
			on: function(event, callback){
				eventHandlers[event] = callback;
			},
			_selectEdgeCallback: function(){},
			_selectNodeCallback: function(){},
			_deselectEdgeCallback: function(){},
			_deselectNodeCallback: function(){}
		};
		this.graph = new Graph(this.visNetwork);
	}
});

QUnit.test("createEdge(), existsEdge(), addRequestToEdge() methods", function(assert){
	var graph = this.graph;
	graph.createNode("www.example.com", HttpRequest.Type.ROOT);
	graph.createNode("www.dependency.com", HttpRequest.Type.EMBEDDED);
	graph.createEdge("www.example.com", "www.dependency.com", Edge.Type.REQUEST);

	assert.ok(graph.existsEdge("www.example.com", "www.dependency.com", Edge.Type.REQUEST), "Added Request edge exists in the graph");
	assert.notOk(graph.existsEdge("www.example.com", "www.dependency.com", Edge.Type.REDIRECT), "No Redirect edge exists in the graph");

	graph.addRequestToEdge("http://www.example.com/test", "http://www.dependency.com/library");
	request = graph.getEdge("www.example.com", "www.dependency.com", Edge.Type.REQUEST).getRequests()[0];
	assert.equal(request.from, "http://www.example.com/test", "from URL of request set successfully");
	assert.equal(request.to, "http://www.dependency.com/library", "to URL of request set succesfully");
});

QUnit.test("createNode(), existsNode(), addRequestToNode() methods", function(assert) {
	var graph = this.graph;
	graph.createNode("www.example.com", HttpRequest.Type.ROOT);

	assert.ok(graph.existsNode("www.example.com"), "Added node exists in the graph");

	var request = new HttpRequest("POST", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	graph.addRequestToNode(request);
	assert.ok(graph.getNode("www.example.com").getRequests().indexOf(request) != -1, "Added request exists in node");
});

QUnit.test("setup listeners", function(assert) {
	var network = this.visNetwork;
	var graph = this.graph;

	var fromNode = new Node(1, HttpRequest.Type.ROOT, "www.example.com");
	var toNode = new Node(2, HttpRequest.Type.EMBEDDED, "www.dependency.com");
	var edge = new Edge(1, Edge.Type.REQUEST, fromNode, toNode);

	var mockedNetwork = sinon.mock(network);

	mockedNetwork.expects("_selectNodeCallback").exactly(1);
	eventHandlers["select"].call(network, {nodes: [fromNode], edges: []});
	mockedNetwork.verify();

	mockedNetwork.expects("_selectEdgeCallback").exactly(1);
	eventHandlers["select"].call(network, {nodes: [], edges: [edge]});
	mockedNetwork.verify();

	mockedNetwork.expects("_deselectNodeCallback").exactly(1);
	eventHandlers["deselectNode"].call(network, {previousSelection: {nodes: [fromNode], edges: []}});
	mockedNetwork.verify();

	mockedNetwork.expects("_deselectEdgeCallback").exactly(1);
	eventHandlers["deselectEdge"].call(network, {previousSelection: {nodes: [], edges: [edge]}});
	mockedNetwork.verify();
});

QUnit.test("_addNodeToNetwork() method calls method body.data.nodes.add() of visNetwork", function(assert) {
	var network = this.visNetwork;
	var graph = this.graph;

	var mockedNetworkNodes = sinon.mock(network.body.data.nodes);
	mockedNetworkNodes.expects("add").once();

	var node = sinon.createStubInstance(Node);
	graph._addNodeToNetwork(node);

	mockedNetworkNodes.verify();
});

QUnit.test("_addEdgeToNetwork() method calls method body.data.edges.add() of visNetwork", function(assert) {
	var network = this.visNetwork;
	var graph = this.graph;

	var mockedNetworkEdges = sinon.mock(network.body.data.edges);
	mockedNetworkEdges.expects("add").once();

	var edge = sinon.createStubInstance(Edge);
	graph._addEdgeToNetwork(edge);

	mockedNetworkEdges.verify();
});

QUnit.test("filterNodes() method returns only filtered nodes", function(assert) {
	var graph = this.graph;

	graph.createNode("www.example.com", HttpRequest.Type.ROOT);
	graph.createNode("www.dependency.com", HttpRequest.Type.EMBEDDED);

	var callback1 = sinon.stub();
	callback1.onCall(0).returns(true);
	callback1.onCall(1).returns(true);
	assert.equal(graph.filterNodes(callback1).length, 2, "All the nodes pass the filtering");

	var callback2 = sinon.stub();
	callback2.onCall(0).returns(true);
	callback2.onCall(1).returns(false);
	assert.equal(graph.filterNodes(callback2).length, 1, "Only 1 node passes the filtering");

	var callback3 = sinon.stub();
	callback3.onCall(0).returns(false);
	callback3.onCall(1).returns(false);
	assert.equal(graph.filterNodes(callback3).length, 0, "No nodes pass the filtering");
});


QUnit.test("notifyForNewNode(), notifyForNewEdge() methods", function(assert) {
	var graphStatsCalculator = new GraphStatsCalculator();
	var mockGraphStatsCalculator = sinon.mock(graphStatsCalculator);
	var graph = this.graph;

	graph.register(graphStatsCalculator);

	var srcNode = sinon.createStubInstance(Node);
	var destinationNode = sinon.createStubInstance(Node);
	var edge = sinon.createStubInstance(Edge);

	mockGraphStatsCalculator.expects("onNewNode").exactly(1).withArgs(srcNode);
	mockGraphStatsCalculator.expects("onNewEdge").exactly(1).withArgs(srcNode, destinationNode, edge);

	graph.notifyForNewNode(srcNode);
	graph.notifyForNewEdge(srcNode, destinationNode, edge);

	mockGraphStatsCalculator.verify();
});
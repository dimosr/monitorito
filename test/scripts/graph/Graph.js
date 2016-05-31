QUnit.module( "graph.Graph", {
	/* Testing Graph with-without visualisation enabled
	   Stubbed visualisation network is used when enabled*/
	beforeEach: function() {
		var visNetwork = {
			body: {
				data: {
					edges: {add: function(){}},
					nodes: {add: function(){}},
				}
			},
			on: function(event, callback){
				this.eventHandlers[event] = callback;
			},
			triggerEvent: function(event, eventParams) {
				this.eventHandlers[event].call(this, eventParams);
			},
			setOptions: function(options) {},
			eventHandlers : {}
		};
		this.graph = new Graph(visNetwork);

		this.network = visNetwork;
		this.mockNetwork = sinon.mock(visNetwork);
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

QUnit.test("Testing setupListeners() method, checking if assigned callback function is called properly", function(assert) {
	var network = this.network;
	var mockNetwork = this.mockNetwork;
	var graph = this.graph;
	var callback = sinon.spy();

	graph.createNode("www.example.com", HttpRequest.Type.ROOT);
	graph.createNode("www.dependency.com", HttpRequest.Type.EMBEDDED);
	graph.createEdge("www.dependency.com", "www.example.com", Edge.Type.REQUEST);


	network.triggerEvent("select", {nodes: [1], edges: []});
	sinon.assert.notCalled(callback);
	graph.onSelectNode(callback);
	network.triggerEvent("select", {nodes: [1], edges: []});
	sinon.assert.calledOnce(callback);
	
	callback.reset();

	network.triggerEvent("select", {nodes: [], edges: [1]});
	sinon.assert.notCalled(callback);
	graph.onSelectEdge(callback);
	network.triggerEvent("select", {nodes: [], edges: [1]});
	sinon.assert.calledOnce(callback);

	callback.reset();

	network.triggerEvent("deselectNode", {previousSelection: {nodes: [1], edges: []}});
	sinon.assert.notCalled(callback);
	graph.onDeselectNode(callback);
	network.triggerEvent("deselectNode", {previousSelection: {nodes: [1], edges: []}});
	sinon.assert.calledOnce(callback);

	callback.reset();

	network.triggerEvent("deselectEdge", {previousSelection: {nodes: [], edges: [1]}});
	sinon.assert.notCalled(callback);
	graph.onDeselectEdge(callback);
	network.triggerEvent("deselectEdge", {previousSelection: {nodes: [], edges: [1]}});
	sinon.assert.calledOnce(callback);
});

QUnit.test("_addNodeToNetwork() method calls method body.data.nodes.add() of visNetwork", function(assert) {
	var network = this.network;
	var graph = this.graph;

	var mockedNetworkNodes = sinon.mock(network.body.data.nodes);
	mockedNetworkNodes.expects("add").once();

	var node = sinon.createStubInstance(Node);
	graph._addNodeToNetwork(node);

	mockedNetworkNodes.verify();
});

QUnit.test("_addEdgeToNetwork() method calls method body.data.edges.add() of visNetwork", function(assert) {
	var network = this.network;
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

QUnit.test("disablePhysics(), enablePhysics() methods", function(assert) {
	var graph = this.graph;
	var network = this.visNetwork;
	var mockNetwork = this.mockNetwork;

	mockNetwork.expects("setOptions").exactly(1).withArgs(sinon.match({physics: {enabled: false}}));
	mockNetwork.expects("setOptions").exactly(1).withArgs(sinon.match({physics: {enabled: true}}));

	graph.enablePhysics();
	graph.disablePhysics();

	mockNetwork.verify();
});
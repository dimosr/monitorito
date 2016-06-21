QUnit.module( "graph.Graph", {
	/* Testing Graph with-without visualisation enabled
	   Stubbed visualisation network is used when enabled*/
	beforeEach: function() {
		this.network = {
			body: {
				data: {
					edges: {add: function(){}, update: function(){}},
					nodes: {add: function(){}, update: function(){}},
				}
			},
			on: function(event, callback){
				this.eventHandlers[event] = callback;
			},
			cluster: function(options){},
			openCluster: function(clusterID){},
			triggerEvent: function(event, eventParams) {
				this.eventHandlers[event].call(this, eventParams);
			},
			setOptions: function(options) {},
			eventHandlers : {}
		};
		this.graph = new Graph(this.network);

		this.mockNetwork = sinon.mock(this.network);
	}
});

QUnit.test("createEdge(), existsEdge(), addRequestToEdge() methods", function(assert){
	var graph = this.graph;
	graph.createNode("www.example.com");
	graph.createNode("www.dependency.com");
	graph.createEdge("www.example.com", "www.dependency.com", Edge.Type.REQUEST);

	assert.ok(graph.existsEdge("www.example.com", "www.dependency.com"), "Added edge exists in the graph");
	assert.equal(graph.getEdge("www.example.com", "www.dependency.com").getType(), Edge.Type.DEFAULT, "Initial edge type is default");

	graph.addRequestToEdge("http://www.example.com/test", "http://www.dependency.com/library");
	request = graph.getEdge("www.example.com", "www.dependency.com").getRequests()[0];
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

QUnit.test("Testing setupListeners() method, checking if assigned callback function is called properly", function(assert) {
	var network = this.network;
	var mockNetwork = this.mockNetwork;
	var graph = this.graph;
	var callback = sinon.spy();

	graph.createNode("www.example.com", HttpRequest.Type.ROOT);
	graph.createNode("www.dependency.com", HttpRequest.Type.EMBEDDED);
	graph.createEdge("www.dependency.com", "www.example.com", Edge.Type.REQUEST);


	network.triggerEvent("select", {nodes: ["www.example.com"], edges: []});
	sinon.assert.notCalled(callback);
	graph.onSelectNode(callback);
	network.triggerEvent("select", {nodes: ["www.example.com"], edges: []});
	sinon.assert.calledOnce(callback);
	
	callback.reset();

	network.triggerEvent("select", {nodes: [], edges: ["1"]});
	sinon.assert.notCalled(callback);
	graph.onSelectEdge(callback);
	network.triggerEvent("select", {nodes: [], edges: ["1"]});
	sinon.assert.calledOnce(callback);

	callback.reset();

	network.triggerEvent("deselectNode", {previousSelection: {nodes: ["www.example.com"], edges: []}});
	sinon.assert.notCalled(callback);
	graph.onDeselectNode(callback);
	network.triggerEvent("deselectNode", {previousSelection: {nodes: ["www.example.com"], edges: []}});
	sinon.assert.calledOnce(callback);

	callback.reset();

	network.triggerEvent("deselectEdge", {previousSelection: {nodes: [], edges: ["1"]}});
	sinon.assert.notCalled(callback);
	graph.onDeselectEdge(callback);
	network.triggerEvent("deselectEdge", {previousSelection: {nodes: [], edges: ["1"]}});
	sinon.assert.calledOnce(callback);
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
	var network = this.visNetwork;
	var mockNetwork = this.mockNetwork;

	mockNetwork.expects("setOptions").exactly(1).withArgs(sinon.match({physics: {enabled: false}}));
	mockNetwork.expects("setOptions").exactly(1).withArgs(sinon.match({physics: {enabled: true}}));

	graph.enablePhysics();
	graph.disablePhysics();

	mockNetwork.verify();
});
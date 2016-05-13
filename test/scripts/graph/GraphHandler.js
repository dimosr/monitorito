QUnit.module( "graph.GraphHandler", {
	beforeEach: function() {
		var visNetwork = sinon.createStubInstance(vis.Network);
		this.graph = new Graph(visNetwork);
		this.mockGraph = sinon.mock(this.graph);

		this.graphHandler = new GraphHandler(this.graph);
		this.controller = new CentralController(sinon.createStubInstance(InterfaceHandler), sinon.createStubInstance(MonitoringService), this.graphHandler);
		this.graphHandler.setController(this.controller);
		this.mockController = sinon.mock(this.controller);
	}
});

QUnit.test("addRequest() with existing node, between different domains and with existing edge", function(assert) {
	var graph = this.graph;
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	var existsEdge = sinon.stub(graph, "existsEdge");
	var existsNode = sinon.stub(graph, "existsNode");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsEdge.onCall(0).returns(true);
	existsNode.onCall(0).returns(true);
	mockGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockGraph.expects("addRequestToEdge").exactly(1).withArgs(rootRequest.url, request.url);
	mockGraph.expects("createEdge").never();

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRequest() without existing node, between same domains", function(assert) {
	var graph = this.graph;
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	var existsNode = sinon.stub(graph, "existsNode");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.example.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsNode.onCall(0).returns(false);
	mockGraph.expects("createNode").exactly(1).withArgs(Util.getUrlHostname(request.url), request.type);
	mockGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockGraph.expects("createEdge").never();

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRequest() with existing node, between different domains without existing edge", function(assert) {
	var graph = this.graph;
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	var existsNode = sinon.stub(graph, "existsNode");
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsNode.onCall(0).returns(true);
	existsEdge.onCall(0).returns(false);
	mockGraph.expects("createNode").never();
	mockGraph.expects("addRequestToNode").exactly(1);
	mockGraph.expects("createEdge").exactly(1);
	mockGraph.expects("addRequestToEdge").exactly(1);

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});


QUnit.test("addRedirect() without existing edge", function(assert){
	var graph = this.graph;
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	existsEdge.onCall(0).returns(false);
	mockGraph.expects("createEdge").exactly(1);
	mockGraph.expects("addRequestToEdge").exactly(1);

	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());
	graphHandler.addRedirect(redirect);
	mockGraph.verify();
});

QUnit.test("addRedirect() with existing edge", function(assert){
	var graph = this.graph;
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	existsEdge.onCall(0).returns(true);
	mockGraph.expects("createEdge").never();
	mockGraph.expects("addRequestToEdge").exactly(1);

	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());
	graphHandler.addRedirect(redirect);
	mockGraph.verify();
});

QUnit.test("Listeners setup", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;

	var assignedHandler = function() {};

	mockGraph.expects("onSelectNode").exactly(1).withArgs(assignedHandler);
	graphHandler.addSelectNodeListener(assignedHandler);

	mockGraph.expects("onSelectEdge").exactly(1).withArgs(assignedHandler);
	graphHandler.addSelectEdgeListener(assignedHandler);

	mockGraph.expects("onDeselectNode").exactly(1).withArgs(assignedHandler);
	graphHandler.addDeselectNodeListener(assignedHandler);

	mockGraph.expects("onDeselectEdge").exactly(1).withArgs(assignedHandler);
	graphHandler.addDeselectEdgeListener(assignedHandler);

	mockGraph.verify();
});

QUnit.test("enableGraphPhysics(), disableGraphPhysics() methods", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;

	mockGraph.expects("enablePhysics").exactly(1);
	mockGraph.expects("disablePhysics").exactly(1);

	graphHandler.enableGraphPhysics();
	graphHandler.disableGraphPhysics();

	mockGraph.verify();
});
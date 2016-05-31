QUnit.module( "graph.GraphHandler", {
	/* Unit tests for the case of graph with visualisation enabled 
	   Behaviour of GraphHandler should be the same, no matter if
	   graph with visualisation is enabled */
	beforeEach: function() {
		var factory = new GraphFactory();
		var graph = factory.buildGraph(Graph.Mode.OFFLINE, null);
		var graphStatsCalculator = new GraphStatsCalculator();
		this.graphHandler = new GraphHandler(graphStatsCalculator);
		this.graphHandler.setGraph(graph);
		this.controller = new CentralController(sinon.createStubInstance(InterfaceHandler), sinon.createStubInstance(MonitoringService), this.graphHandler);
		this.graphHandler.setController(this.controller);
		
		this.mockGraph = sinon.mock(graph);
		this.mockGraphStatsCalculator = sinon.mock(graphStatsCalculator);
		this.mockController = sinon.mock(this.controller);
	}
});

QUnit.test("addRequest() with existing node, between different domains and with existing edge", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	mockGraph.expects("existsEdge").onCall(0).returns(true);
	mockGraph.expects("existsNode").onCall(0).returns(true);
	mockGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockGraph.expects("addRequestToEdge").exactly(1).withArgs(rootRequest.url, request.url);
	mockGraph.expects("createEdge").never();

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRequest() without existing node, between same domains", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.example.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	mockGraph.expects("existsNode").onCall(0).returns(false);
	mockGraph.expects("createNode").exactly(1).withArgs(Util.getUrlHostname(request.url), request.type);
	mockGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockGraph.expects("createEdge").never();

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRequest() with existing node, between different domains without existing edge", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	mockGraph.expects("existsNode").onCall(0).returns(true);
	mockGraph.expects("existsEdge").onCall(0).returns(false);
	mockGraph.expects("createNode").never();
	mockGraph.expects("addRequestToNode").exactly(1);
	mockGraph.expects("createEdge").exactly(1);
	mockGraph.expects("addRequestToEdge").exactly(1);

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});


QUnit.test("addRedirect() without existing edge", function(assert){
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	mockGraph.expects("existsEdge").onCall(0).returns(false);
	mockGraph.expects("createEdge").exactly(1);
	mockGraph.expects("addRequestToEdge").exactly(1);

	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());
	graphHandler.addRedirect(redirect);
	mockGraph.verify();
});

QUnit.test("addRedirect() with existing edge", function(assert){
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	mockGraph.expects("existsEdge").onCall(0).returns(true);
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

QUnit.test("getGraphStatistics(), getGraphNodeMetrics() methods", function(assert) {
	var graphHandler = this.graphHandler;
	var mockGraphStatsCalculator = this.mockGraphStatsCalculator;
	var node = sinon.createStubInstance(Node);

	mockGraphStatsCalculator.expects("getStatistics").exactly(1);
	mockGraphStatsCalculator.expects("getNodeMetrics").exactly(1).withArgs(node);

	graphHandler.getGraphStatistics();
	graphHandler.getGraphNodeMetrics(node);

	mockGraphStatsCalculator.verify();
});
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

QUnit.test("addRequest() between different domains, without referrer and with existing edge", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var rootRequest = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var request = new HttpRequest(2, "GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");

	mockGraph.expects("addRequestToNode").withArgs(request);
	mockGraph.expects("addRequestToEdge").withArgs(rootRequest.url, request);

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRequest() between same domains", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var rootRequest = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var request = new HttpRequest(2, "GET", "http://www.example.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");

	mockGraph.expects("addRequestToNode").withArgs(request);
	mockGraph.expects("addRequestToEdge").never();

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
});

QUnit.test("addRedirect() between different domains, adding edge", function(assert){
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());

	mockGraph.expects("addRedirectToEdge").withArgs(redirect);

	graphHandler.addRedirect(redirect);
	mockGraph.verify();
});

QUnit.test("addRedirect() between same domains, not adding edge", function(assert){
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var redirect = new Redirect("http://www.example.com/test", "http://www.example.com/test2", Edge.Type.REQUEST, Date.now());

	mockGraph.expects("addRedirectToEdge").never();

	graphHandler.addRedirect(redirect);
	mockGraph.verify();
});

QUnit.test("addGraphListeners", function(assert) {
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;

	var assignedHandler = function() {};

	mockGraph.expects("addListeners").exactly(1);
	graphHandler.addGraphListeners(assignedHandler, assignedHandler, assignedHandler, assignedHandler);

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
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

	var node = {addRequest: function(request){}};
	var mockNode = sinon.mock(node);
	var edge = {addLink: function(fromURL, request, linkType){}};
	var mockEdge = sinon.mock(edge);
	mockGraph.expects("getNode").withArgs("www.dependency.com").atLeast(1).returns(node);
	mockGraph.expects("existsEdge").withArgs("www.example.com", "www.dependency.com").atLeast(1).returns(true);
	mockNode.expects("addRequest").withArgs(request);
	mockGraph.expects("getEdgeBetweenNodes").withArgs("www.example.com", "www.dependency.com").atLeast(1).returns(edge);
	mockEdge.expects("addLink").withArgs(rootRequest.url, request, DomainEdge.LinkType.REQUEST).exactly(1);

	graphHandler.addRequest(rootRequest, request);
	mockGraph.verify();
	mockNode.verify();
});

QUnit.test("addRedirect() between different domains, adding edge", function(assert){
	var mockGraph = this.mockGraph;
	var graphHandler = this.graphHandler;
	
	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", HttpRequest.Type.EMBEDDED, Date.now());

	var edge = {addLink: function(fromURL, link, linkType){}};
	var mockEdge = sinon.mock(edge);
	mockGraph.expects("getEdgeBetweenNodes").withArgs("www.example.com", "www.dependency.com").atLeast(1).returns(edge);
	mockEdge.expects("addLink").withArgs(redirect.getInitialURL(), redirect, DomainEdge.LinkType.REDIRECT).exactly(1);

	graphHandler.addRedirect(redirect);
	mockGraph.verify();
	mockEdge.verify();
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
	var node = sinon.createStubInstance(DomainNode);

	mockGraphStatsCalculator.expects("getStatistics").exactly(1);
	mockGraphStatsCalculator.expects("getNodeMetrics").exactly(1).withArgs(node);

	graphHandler.getGraphStatistics();
	graphHandler.getGraphNodeMetrics(node);

	mockGraphStatsCalculator.verify();
});
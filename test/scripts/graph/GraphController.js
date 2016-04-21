QUnit.module( "graph.GraphController", {
	beforeEach: function() {
		var visNetwork = sinon.createStubInstance(vis.Network);
		this.graph = new Graph(visNetwork);
		this.mockedGraph = sinon.mock(this.graph);

		this.interfaceHandler = new InterfaceHandler();
		this.mockedInterfaceHandler = sinon.mock(this.interfaceHandler);
		this.graphController = new GraphController(this.graph, this.interfaceHandler);
	}
});

QUnit.test("addRequest() with existing node, between different domains and with existing edge", function(assert) {
	var graph = this.graph;
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;
	var existsEdge = sinon.stub(graph, "existsEdge");
	var existsNode = sinon.stub(graph, "existsNode");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsEdge.onCall(0).returns(true);
	existsNode.onCall(0).returns(true);
	mockedGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockedGraph.expects("addRequestToEdge").exactly(1).withArgs(rootRequest.url, request.url);
	mockedGraph.expects("createEdge").never();

	graphController.addRequest(rootRequest, request);
	mockedGraph.verify();
});

QUnit.test("addRequest() without existing node, between same domains", function(assert) {
	var graph = this.graph;
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;
	var existsNode = sinon.stub(graph, "existsNode");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.example.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsNode.onCall(0).returns(false);
	mockedGraph.expects("createNode").exactly(1).withArgs(Util.getUrlHostname(request.url), request.type);
	mockedGraph.expects("addRequestToNode").exactly(1).withArgs(request);
	mockedGraph.expects("createEdge").never();

	graphController.addRequest(rootRequest, request);
	mockedGraph.verify();
});

QUnit.test("addRequest() with existing node, between different domains without existing edge", function(assert) {
	var graph = this.graph;
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;
	var existsNode = sinon.stub(graph, "existsNode");
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);

	existsNode.onCall(0).returns(true);
	existsEdge.onCall(0).returns(false);
	mockedGraph.expects("createNode").never();
	mockedGraph.expects("addRequestToNode").exactly(1);
	mockedGraph.expects("createEdge").exactly(1);
	mockedGraph.expects("addRequestToEdge").exactly(1);

	graphController.addRequest(rootRequest, request);
	mockedGraph.verify();
});


QUnit.test("addRedirect() without existing edge", function(assert){
	var graph = this.graph;
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	existsEdge.onCall(0).returns(false);
	mockedGraph.expects("createEdge").exactly(1);
	mockedGraph.expects("addRequestToEdge").exactly(1);

	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());
	graphController.addRedirect(redirect);
	mockedGraph.verify();
});

QUnit.test("addRedirect() with existing edge", function(assert){
	var graph = this.graph;
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;
	var existsEdge = sinon.stub(graph, "existsEdge");
	
	existsEdge.onCall(0).returns(true);
	mockedGraph.expects("createEdge").never();
	mockedGraph.expects("addRequestToEdge").exactly(1);

	var redirect = new Redirect("http://www.example.com/test", "http://www.dependency.com/library", Edge.Type.REQUEST, Date.now());
	graphController.addRedirect(redirect);
	mockedGraph.verify();
});

QUnit.test("Listeners setup", function(assert) {
	var mockedGraph = this.mockedGraph;
	var graphController = this.graphController;

	var assignedHandler = function() {};

	mockedGraph.expects("onSelectNode").exactly(1).withArgs(assignedHandler);
	graphController.addSelectNodeListener(assignedHandler);

	mockedGraph.expects("onSelectEdge").exactly(1).withArgs(assignedHandler);
	graphController.addSelectEdgeListener(assignedHandler);

	mockedGraph.expects("onDeselectNode").exactly(1).withArgs(assignedHandler);
	graphController.addDeselectNodeListener(assignedHandler);

	mockedGraph.expects("onDeselectEdge").exactly(1).withArgs(assignedHandler);
	graphController.addDeselectEdgeListener(assignedHandler);

	mockedGraph.verify();
});

QUnit.test("increaseFirstPartyDomains(), increaseThirdPartyDomains() methods", function(assert) {
	var graphController = this.graphController;
	var mockedInterfaceHandler = this.mockedInterfaceHandler;
	

	mockedInterfaceHandler.expects("setFirstPartyDomains").exactly(1).withArgs(1);
	mockedInterfaceHandler.expects("setFirstPartyDomains").exactly(1).withArgs(2);
	mockedInterfaceHandler.expects("setThirdPartyDomains").exactly(1).withArgs(1);
	mockedInterfaceHandler.expects("setThirdPartyDomains").exactly(1).withArgs(2);

	graphController.increaseFirstPartyDomains();
	graphController.increaseFirstPartyDomains();
	graphController.increaseThirdPartyDomains();
	graphController.increaseThirdPartyDomains();

	mockedInterfaceHandler.verify();
});
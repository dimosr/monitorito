QUnit.module( "controller.CentralController", {
	beforeEach: function() {
		var interfaceHandler = new InterfaceHandler();
		this.mockInterfaceHandler = sinon.mock(interfaceHandler);

		var monitoringService = new MonitoringService(new EventSource());
		this.mockMonitoringService = sinon.mock(monitoringService);

		var graphHandler = new GraphHandler();
		this.mockGraphHandler = sinon.mock(graphHandler);

		var storageService = new ChromeStorageService({clear: function(){}, get: function(){}, set: function(){}});
		this.mockStorageService = sinon.mock(storageService);

		this.controller = new CentralController(interfaceHandler, monitoringService, graphHandler, storageService);
	}
});

QUnit.test("addRequestToGraph(), addRedirectToGraph() methods", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	var rootRequest = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var request = new HttpRequest(2, "GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");
	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());

	mockGraphHandler.expects("addRequest").exactly(1).withArgs(rootRequest, request);
	mockGraphHandler.expects("addRedirect").exactly(1).withArgs(redirect);

	controller.addRequestToGraph(rootRequest, request);
	controller.addRedirectToGraph(redirect);

	mockGraphHandler.verify();
});

QUnit.test("enableMonitoring(), disableMonitoring() methods", function(assert) {
	var controller = this.controller;
	var mockMonitoringService = this.mockMonitoringService;

	mockMonitoringService.expects("enable").exactly(1);
	mockMonitoringService.expects("disable").exactly(1);

	controller.enableMonitoring();
	controller.disableMonitoring();

	mockMonitoringService.verify();
});

QUnit.test("extractMonitoredData()", function(assert) {
	var controller = this.controller;
	var mockMonitoringService = this.mockMonitoringService;
	var mockStorageService = this.mockStorageService;

	var mockSessions = new Object();
	var mockRedirects = new Object();

	mockStorageService.expects("extractData").once();

	var monitoredData = controller.extractMonitoredData();

	mockMonitoringService.verify();
	mockStorageService.verify();
});

QUnit.test("getGraphStatistics(), getGraphNodeMetrics() methods", function(assert) {
	var mockGraphHandler = this.mockGraphHandler;
	var controller = this.controller;
	var stubNode = sinon.createStubInstance(DomainNode);

	mockGraphHandler.expects("getGraphStatistics").exactly(1);
	mockGraphHandler.expects("getGraphNodeMetrics").exactly(1).withArgs(stubNode);

	controller.getGraphStatistics();
	controller.getGraphNodeMetrics(stubNode);

	mockGraphHandler.verify();
});

QUnit.test("enableGraphPhysics(), disableGraphPhysics() methods", function(assert) {
	var mockGraphHandler = this.mockGraphHandler;
	var controller = this.controller;

	mockGraphHandler.expects("enableGraphPhysics").exactly(1);
	mockGraphHandler.expects("disableGraphPhysics").exactly(1);

	controller.enableGraphPhysics();
	controller.disableGraphPhysics();

	mockGraphHandler.verify();
});

QUnit.test("storeRequest(), storeRedirect() methods", function(assert) {
	var mockStorageService = this.mockStorageService;
	var controller = this.controller;

	var sessionID = 1;
	var request = sinon.createStubInstance(HttpRequest);
	var redirect = sinon.createStubInstance(Redirect);

	mockStorageService.expects("storeRequest").once().withExactArgs(sessionID, request);
	mockStorageService.expects("storeRedirect").once().withExactArgs(sessionID, redirect);

	controller.storeRequest(sessionID, request);
	controller.storeRedirect(sessionID, redirect);

	mockStorageService.verify();
});

QUnit.test("setGraphMode(Graph.Mode.ONLINE) test", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;
	var mockInterfaceHandler = this.mockInterfaceHandler;

	mockInterfaceHandler.expects("getGraphDomElement").returns(jQuery("<div>")[0]);
	mockGraphHandler.expects("setGraph").exactly(1);
	mockGraphHandler.expects("addGraphListeners").exactly(1);

	controller.setGraphMode(Graph.Mode.ONLINE);

	mockGraphHandler.verify();
});

QUnit.test("setGraphMode(Graph.Mode.OFFLINE) test", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;
	var mockInterfaceHandler = this.mockInterfaceHandler;

	mockInterfaceHandler.expects("disableVisualisation").exactly(1);
	mockGraphHandler.expects("setGraph").exactly(1);

	controller.setGraphMode(Graph.Mode.OFFLINE);

	mockGraphHandler.verify();
});

QUnit.test("setGraphMode(Graph.Mode.ONLINE) test with non-compliant parameters", function(assert) {
	var controller = this.controller;

	assert.throws(
	function() {
		controller.setGraphMode(Graph.Mode.ONLINE)
	}, "ONLINE mode should be provided with the corresponding DOM element for the vis Graph");
});

QUnit.test("setGraphMode(mode) with mode not belonging in Graph.Mode values", function(assert) {
	var controller = this.controller;

	assert.throws(
	function() {
		controller.setGraphMode(new Object())
	}, "Exception is raised, if provided mode is not valid");
});

QUnit.test("Clustering with expanded Resources, not allowed", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	mockGraphHandler.expects("getExpandedNodes").exactly(1).returns([sinon.createStubInstance(DomainNode)]);
	mockGraphHandler.expects("clusterByDomain").never();

	assert.throws(
		function() {
			controller.clusterByDomain("cluster-1", ["example.com", "test.com"]);
		},
		Error,
		"Cannot create cluster, when there are expanded Resource nodes"
	);
	mockGraphHandler.verify();

});

QUnit.test("Clustering without expanded Resources, allowed", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	mockGraphHandler.expects("getExpandedNodes").exactly(1).returns([]);
	mockGraphHandler.expects("clusterByDomain").exactly(1);

	controller.clusterByDomain("cluster-1", ["example.com", "test.com"]);
	mockGraphHandler.verify();

});

QUnit.test("Expanding DomainNode, while there are active clusters, not allowed", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	mockGraphHandler.expects("getClusters").exactly(1).returns([sinon.createStubInstance(Cluster)]);
	mockGraphHandler.expects("expandDomainNode").never();

	assert.throws(
		function() {
			controller.expandDomainNode(1);
		},
		Error,
		"Cannot expand DomainNode, when there are existing clusters"
	);
	mockGraphHandler.verify();
});

QUnit.test("Expanding DomainNode, while there are active clusters, not allowed", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	mockGraphHandler.expects("getClusters").exactly(1).returns([]);
	mockGraphHandler.expects("expandDomainNode").exactly(1);


	controller.expandDomainNode(1);
	mockGraphHandler.verify();
});
QUnit.module( "monitor.MonitoringService", {
	beforeEach: function() {
		var eventSource = new EventSource();
		this.monitoringService = new MonitoringService(eventSource);

		this.controller = new CentralController(sinon.createStubInstance(InterfaceHandler), this.monitoringService, sinon.createStubInstance(GraphHandler), sinon.createStubInstance(ChromeStorageService));
		this.monitoringService.setController(this.controller);
		this.mockController = sinon.mock(this.controller);
	}
});

QUnit.test("enable(), disable(), isEnabled() methods", function(assert){
	var monitoringService = this.monitoringService;

	assert.ok(monitoringService.isEnabled(), "initialised monitoringService enabled by default");

	monitoringService.disable();
	assert.notOk(monitoringService.isEnabled(), "disable() working");

	monitoringService.enable();
	assert.ok(monitoringService.isEnabled(), "enable() working");
});


QUnit.test("addExcludedUrlPattern(), toBeExcluded() methods", function(assert){
	var monitoringService = this.monitoringService;

	assert.ok(!monitoringService.toBeExcluded("http://www.example.com/sub/test"), "no url is excluded by default");

	monitoringService.addExcludedUrlPattern("example.com");
	assert.ok(monitoringService.toBeExcluded("http://www.example.com/sub/test"), "extensions of added url patterns are excluded");
	assert.ok(!monitoringService.toBeExcluded("http://www.example.co.uk/sub/test"), "not-extensions of added url patterns are not excluded");
});

QUnit.test("onRequest(): incoming request with monitoring service disabled", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRequestToGraph").never();

	var incomingRequest = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var tabId = 1;

	monitoringService.disable();
	monitoringService.onRequest(incomingRequest, tabId);
	mockController.verify();
});

QUnit.test("onRequest(): incoming embedded request from not monitored session", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRequestToGraph").never();

	var incomingRequest = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.EMBEDDED, "main_frame");
	var requestId = 1;
	var tabId = 1;

	monitoringService.onRequest(requestId, incomingRequest, tabId);
	monitoringService.onRequestCompleted(requestId);
	mockController.verify();
});

QUnit.test("onRequest(): incoming embedded request from monitored session", function(assert){
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	var tabId = 1;
	var requestId1 = 1;
	var incomingRequest1 = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var requestId2 = 2;
	var incomingRequest2 = new HttpRequest(1, "GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED, "script");

	mockController.expects("addRequestToGraph").exactly(2);
	mockController.expects("addRedirectToGraph").never();
	mockController.expects("storeRequest").exactly(2);

	monitoringService.onRequest(requestId1, incomingRequest1, tabId);
	monitoringService.onRequest(requestId2, incomingRequest2, tabId);
	monitoringService.onRequestCompleted(requestId1);
	monitoringService.onRequestCompleted(requestId2);

	mockController.verify();
});

QUnit.test("onRedirect(): incoming redirect with monitoring service disabled", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	monitoringService.disable();
	mockController.expects("addRedirectToGraph").never();
	mockController.expects("storeRedirect").never();

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	var tabId = 1;
	monitoringService.onRedirect(redirect, tabId);

	mockController.verify();
});

QUnit.test("onRedirect(): incoming redirect from not monitored session", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRedirectToGraph").never();
	mockController.expects("storeRedirect").never();

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.EMBEDDED, Date.now());
	var tabId = 1;
	monitoringService.onRedirect(redirect, tabId);

	mockController.verify();
});

QUnit.test("onRedirect(): incoming redirect from monitored session", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	var requestId = 1;
	var request = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.EMBEDDED, Date.now());
	var tabId = 1;

	mockController.expects("addRedirectToGraph").exactly(1).withArgs(redirect);
	mockController.expects("storeRedirect").exactly(1).withArgs(1, redirect);

	monitoringService.onRequest(requestId, request, tabId);
	monitoringService.onRedirect(requestId, redirect, tabId);

	mockController.verify();
});

QUnit.test("onRedirect(): monitored redirect not added to graph without the final request", function(assert) {
	var monitoringService = this.monitoringService;
	var mockController = this.mockController;

	mockController.expects("addRedirectToGraph").never();

	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());
	var tabId = 1;
	monitoringService.onRedirect(redirect, tabId);

	mockController.verify();
});

QUnit.test("_isTabMonitored(), _getTabSession() method", function(assert) {
	var monitoringService = this.monitoringService;

	var requestId = 1;
	var request = new HttpRequest(1, "GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
	var tabId = 1;
	monitoringService.onRequest(requestId, request, tabId);

	assert.ok(monitoringService._isTabMonitored(1), "Tab with id 1 is monitored, since at least one request has been triggered from it");
	assert.notOk(monitoringService._isTabMonitored(2), "Tab with id 2 is not monitored, since no request has been triggered from it");
	assert.ok(monitoringService._getTabSession(1) != null, "a session has been created for tab 1");
	assert.ok(monitoringService._getTabSession(2) == null, "no session has been created for tab 2");
});